"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RenderTask } from "pdfjs-dist";
import {
  ArrowClockwiseIcon,
  ArrowsHorizontalIcon,
  ArrowSquareOutIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CornersInIcon,
  CornersOutIcon,
  DownloadSimpleIcon,
  FrameCornersIcon,
  MinusIcon,
  PlusIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import type { OfferBookletManifest } from "@/features/offer/server/offerBookletManifest";
import { useOfferPdfDocument } from "./useOfferPdfDocument";
import styles from "./OfferPdfViewer.module.scss";

interface OfferPdfViewerProps {
  manifest: OfferBookletManifest;
}

type ZoomMode = "fit-width" | "fit-page" | "custom";

// Zoom bounds and step. `scale` is a pdf.js scale where 1 = 100% (actual size).
const MIN_SCALE = 0.25;
const MAX_SCALE = 6;
const ZOOM_STEP = 1.25;
// Cap the backing store so a deep zoom never allocates a canvas the browser
// (especially mobile) refuses to paint.
const MAX_CANVAS_DIM = 4096;
const MAX_DPR = 3;
const SWIPE_THRESHOLD = 45;
const ICON_SIZE = 18;
const ICON_WEIGHT = "bold" as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const readPageFromHash = (): number | null => {
  if (typeof window === "undefined") return null;
  const match = window.location.hash.match(/page=(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
};

export const OfferPdfViewer = ({ manifest }: OfferPdfViewerProps) => {
  const { t } = useTranslation();
  const { token, locale, hash, aspectRatio } = manifest;

  // ---- URLs (all same-origin; token already lives in the page URL) ----------
  const pageImageUrl = useCallback(
    (page: number, variant: "full" | "thumb") =>
      `/api/offer/page?t=${encodeURIComponent(token)}&l=${locale}&p=${page}&v=${hash}&s=${variant}`,
    [token, locale, hash],
  );
  // Attachment download + the source pdf.js parses.
  const pdfDownloadUrl = useMemo(
    () => `/api/offer/pdf?t=${encodeURIComponent(token)}&l=${locale}`,
    [token, locale],
  );
  // Same document served inline for the native browser viewer.
  const pdfInlineUrl = useMemo(
    () => `${pdfDownloadUrl}&inline=1`,
    [pdfDownloadUrl],
  );

  const { doc, pageCount, status } = useOfferPdfDocument(
    pdfDownloadUrl,
    manifest.pageCount,
  );

  // ---- View state -----------------------------------------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [zoomMode, setZoomMode] = useState<ZoomMode>("fit-page");
  const [customScale, setCustomScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [displayScale, setDisplayScale] = useState(1);
  const [firstRenderReady, setFirstRenderReady] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [placeholderError, setPlaceholderError] = useState(false);
  const [placeholderImgLoaded, setPlaceholderImgLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  // Latest effective scale, read synchronously by the zoom buttons.
  const displayScaleRef = useRef(1);
  displayScaleRef.current = displayScale;

  const hasError = status === "error";
  const showPlaceholder = !firstRenderReady && !hasError;

  // ---- Navigation -----------------------------------------------------------
  const goTo = useCallback(
    (page: number) => setCurrentPage((prev) => {
      const next = clamp(Math.round(page), 1, pageCount);
      return Number.isFinite(next) ? next : prev;
    }),
    [pageCount],
  );
  const goPrev = useCallback(() => goTo(currentPage - 1), [goTo, currentPage]);
  const goNext = useCallback(() => goTo(currentPage + 1), [goTo, currentPage]);

  // Clamp if the real page count comes back smaller than a deep-linked page.
  useEffect(() => {
    setCurrentPage((prev) => clamp(prev, 1, pageCount));
  }, [pageCount]);

  // Deep-link: honor #page=N on mount.
  useEffect(() => {
    const fromHash = readPageFromHash();
    if (fromHash) setCurrentPage(clamp(fromHash, 1, manifest.pageCount));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the hash in sync so a page can be shared, and the input in sync.
  useEffect(() => {
    setPageInput(String(currentPage));
    if (typeof window === "undefined") return;
    const { pathname, search } = window.location;
    const next =
      currentPage > 1
        ? `${pathname}${search}#page=${currentPage}`
        : `${pathname}${search}`;
    window.history.replaceState(null, "", next);
  }, [currentPage]);

  // ---- Zoom -----------------------------------------------------------------
  const zoomIn = useCallback(() => {
    setCustomScale(clamp(displayScaleRef.current * ZOOM_STEP, MIN_SCALE, MAX_SCALE));
    setZoomMode("custom");
  }, []);
  const zoomOut = useCallback(() => {
    setCustomScale(clamp(displayScaleRef.current / ZOOM_STEP, MIN_SCALE, MAX_SCALE));
    setZoomMode("custom");
  }, []);
  const resetZoom = useCallback(() => {
    setCustomScale(1);
    setZoomMode("custom");
  }, []);
  const fitWidth = useCallback(() => setZoomMode("fit-width"), []);
  const fitPage = useCallback(() => setZoomMode("fit-page"), []);
  const rotate = useCallback(() => setRotation((r) => (r + 90) % 360), []);

  // ---- Measure the stage (drives fit-to-width / fit-to-page) -----------------
  // We read the ResizeObserver's content-box rect (padding excluded), so the fit
  // math is exact at every breakpoint regardless of the stage's CSS padding.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const rect = entry.contentRect;
      setViewport({ width: rect.width, height: rect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---- Render the current page ----------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!doc || !canvas || viewport.width === 0) return;

    let cancelled = false;
    setIsRendering(true);

    (async () => {
      try {
        const page = await doc.getPage(currentPage);
        if (cancelled) return;

        const rotationTotal = (page.rotate + rotation) % 360;
        const base = page.getViewport({ scale: 1, rotation: rotationTotal });
        const availWidth = Math.max(viewport.width, 1);
        const availHeight = Math.max(viewport.height, 1);

        let scale: number;
        if (zoomMode === "fit-width") {
          scale = availWidth / base.width;
        } else if (zoomMode === "fit-page") {
          scale = Math.min(availWidth / base.width, availHeight / base.height);
        } else {
          scale = customScale;
        }
        scale = clamp(scale, MIN_SCALE, MAX_SCALE);

        const cssViewport = page.getViewport({ scale, rotation: rotationTotal });
        const outputScale = Math.min(window.devicePixelRatio || 1, MAX_DPR);
        // Shrink the backing store if a deep zoom would exceed the canvas cap.
        const overshoot =
          (Math.max(cssViewport.width, cssViewport.height) * outputScale) /
          MAX_CANVAS_DIM;
        const backingScale = overshoot > 1 ? (scale * outputScale) / overshoot : scale * outputScale;
        const renderViewport = page.getViewport({
          scale: backingScale,
          rotation: rotationTotal,
        });

        // Cancel any in-flight render before touching the shared canvas.
        renderTaskRef.current?.cancel();

        canvas.width = Math.floor(renderViewport.width);
        canvas.height = Math.floor(renderViewport.height);
        canvas.style.width = `${Math.floor(cssViewport.width)}px`;
        canvas.style.height = `${Math.floor(cssViewport.height)}px`;

        const context = canvas.getContext("2d");
        if (!context) return;
        // PDFs draw on transparent paper; paint white first so nothing shows
        // through between page renders.
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);

        const task = page.render({
          canvas,
          viewport: renderViewport,
        });
        renderTaskRef.current = task;
        await task.promise;
        if (cancelled) return;

        setDisplayScale(scale);
        setFirstRenderReady(true);
        setIsRendering(false);
      } catch (error) {
        // A superseded render rejects with RenderingCancelledException — expected.
        if (
          !cancelled &&
          (error as { name?: string })?.name !== "RenderingCancelledException"
        ) {
          console.error("Offer page render error:", error);
          setIsRendering(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [doc, currentPage, zoomMode, customScale, rotation, viewport.width, viewport.height]);

  // Reset scroll to the top of a page when it changes or a fit mode is chosen.
  useEffect(() => {
    stageRef.current?.scrollTo({ top: 0, left: 0 });
  }, [currentPage, zoomMode]);

  // ---- Mouse drag-to-pan (touch pans natively via overflow scrolling) -------
  const panState = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const [isGrabbing, setIsGrabbing] = useState(false);

  const canPan = useCallback(() => {
    const el = stageRef.current;
    return !!el && (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      const el = stageRef.current;
      if (!el || !canPan()) return;
      panState.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop };
      setIsGrabbing(true);
      el.setPointerCapture(e.pointerId);
    },
    [canPan],
  );
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const el = stageRef.current;
    const start = panState.current;
    if (!el || !start) return;
    el.scrollLeft = start.left - (e.clientX - start.x);
    el.scrollTop = start.top - (e.clientY - start.y);
  }, []);
  const endPan = useCallback((e: React.PointerEvent) => {
    const el = stageRef.current;
    if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    panState.current = null;
    setIsGrabbing(false);
  }, []);

  // ---- Wheel (Ctrl/Cmd+scroll) zoom + touch pinch/swipe ---------------------
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      setCustomScale(clamp(displayScaleRef.current * factor, MIN_SCALE, MAX_SCALE));
      setZoomMode("custom");
    };

    let pinchStartDist = 0;
    let pinchStartScale = 1;
    let touchStartX = 0;
    let touchStartY = 0;

    const dist = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchStartDist = dist(e.touches);
        pinchStartScale = displayScaleRef.current;
      } else if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchStartDist > 0) {
        e.preventDefault();
        const ratio = dist(e.touches) / pinchStartDist;
        setCustomScale(clamp(pinchStartScale * ratio, MIN_SCALE, MAX_SCALE));
        setZoomMode("custom");
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (pinchStartDist > 0) {
        pinchStartDist = 0;
        return;
      }
      // Swipe to change pages, but only when the page isn't panned sideways.
      const horizontallyScrollable = el.scrollWidth > el.clientWidth + 1;
      if (horizontallyScrollable || e.changedTouches.length === 0) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) goNext();
        else goPrev();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [goNext, goPrev]);

  // ---- Keyboard -------------------------------------------------------------
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Let the jump-to-page input keep its own keys.
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      switch (e.key) {
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          goPrev();
          break;
        case "ArrowRight":
        case "PageDown":
          e.preventDefault();
          goNext();
          break;
        case "Home":
          e.preventDefault();
          goTo(1);
          break;
        case "End":
          e.preventDefault();
          goTo(pageCount);
          break;
        case "+":
        case "=":
          e.preventDefault();
          zoomIn();
          break;
        case "-":
          e.preventDefault();
          zoomOut();
          break;
        case "0":
          e.preventDefault();
          resetZoom();
          break;
        default:
          break;
      }
    },
    [goPrev, goNext, goTo, pageCount, zoomIn, zoomOut, resetZoom],
  );

  // ---- Fullscreen -----------------------------------------------------------
  useEffect(() => {
    setFullscreenSupported(
      typeof document !== "undefined" &&
        !!document.fullscreenEnabled &&
        typeof rootRef.current?.requestFullscreen === "function",
    );
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen?.();
    } else {
      void rootRef.current?.requestFullscreen?.();
    }
  }, []);

  const commitPageInput = useCallback(() => {
    const parsed = Number.parseInt(pageInput, 10);
    if (Number.isFinite(parsed)) goTo(parsed);
    else setPageInput(String(currentPage));
  }, [pageInput, goTo, currentPage]);

  const zoomPercent = Math.round(displayScale * 100);
  const isMultiPage = pageCount > 1;
  // Drives the fit-to-page sizing of both the loading skeleton and the rendered
  // page, so the skeleton→canvas swap has no layout shift.
  const stageStyle = {
    ["--offer-pdf-ar" as string]: `${aspectRatio}`,
  } as React.CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`${styles.viewer} ${isFullscreen ? styles.fullscreen : ""}`}
      role="group"
      aria-roledescription={t("pdf_viewer_label")}
      aria-label={t("pdf_viewer_label")}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className={styles.toolbar}>
        {/* Page navigation */}
        {isMultiPage ? (
          <div className={styles.segment} role="group" aria-label={t("pdf_viewer_label")}>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              onClick={goPrev}
              disabled={currentPage <= 1}
              aria-label={t("pdf_viewer_previous_page")}
            >
              <CaretLeftIcon size={ICON_SIZE} weight={ICON_WEIGHT} />
            </Button>
            <div className={styles.pageJump}>
              <input
                className={styles.pageInput}
                type="text"
                inputMode="numeric"
                value={pageInput}
                aria-label={t("pdf_viewer_go_to_page")}
                onChange={(e) => setPageInput(e.target.value.replace(/[^\d]/g, ""))}
                onBlur={commitPageInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitPageInput();
                    (e.target as HTMLInputElement).blur();
                  }
                }}
              />
              <span className={styles.pageTotal} aria-live="polite">
                / {pageCount}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              onClick={goNext}
              disabled={currentPage >= pageCount}
              aria-label={t("pdf_viewer_next_page")}
            >
              <CaretRightIcon size={ICON_SIZE} weight={ICON_WEIGHT} />
            </Button>
          </div>
        ) : (
          <div className={styles.segment} aria-hidden="true" />
        )}

        {/* Zoom + fit + rotate (hidden on mobile — pinch to zoom instead) */}
        <div className={`${styles.segment} ${styles.zoomSegment}`}>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={zoomOut}
            disabled={displayScale <= MIN_SCALE + 0.001}
            aria-label={t("pdf_viewer_zoom_out")}
          >
            <MinusIcon size={ICON_SIZE} weight={ICON_WEIGHT} />
          </Button>
          <button
            type="button"
            className={styles.zoomValue}
            onClick={resetZoom}
            aria-label={t("pdf_viewer_zoom_reset")}
          >
            {zoomPercent}%
          </button>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={zoomIn}
            disabled={displayScale >= MAX_SCALE - 0.001}
            aria-label={t("pdf_viewer_zoom_in")}
          >
            <PlusIcon size={ICON_SIZE} weight={ICON_WEIGHT} />
          </Button>
          <span className={styles.divider} aria-hidden="true" />
          <Button
            variant={zoomMode === "fit-width" ? "secondary" : "ghost"}
            size="sm"
            iconOnly
            onClick={fitWidth}
            aria-pressed={zoomMode === "fit-width"}
            aria-label={t("pdf_viewer_fit_width")}
          >
            <ArrowsHorizontalIcon size={ICON_SIZE} weight={ICON_WEIGHT} />
          </Button>
          <Button
            variant={zoomMode === "fit-page" ? "secondary" : "ghost"}
            size="sm"
            iconOnly
            onClick={fitPage}
            aria-pressed={zoomMode === "fit-page"}
            aria-label={t("pdf_viewer_fit_page")}
          >
            <FrameCornersIcon size={ICON_SIZE} weight={ICON_WEIGHT} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={rotate}
            aria-label={t("pdf_viewer_rotate")}
          >
            <ArrowClockwiseIcon size={ICON_SIZE} weight={ICON_WEIGHT} />
          </Button>
        </div>

        {/* Actions */}
        <div className={styles.segment}>
          {fullscreenSupported ? (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              className={styles.desktopOnly}
              onClick={toggleFullscreen}
              aria-label={
                isFullscreen
                  ? t("pdf_viewer_exit_fullscreen")
                  : t("pdf_viewer_fullscreen")
              }
            >
              {isFullscreen ? (
                <CornersInIcon size={ICON_SIZE} weight={ICON_WEIGHT} />
              ) : (
                <CornersOutIcon size={ICON_SIZE} weight={ICON_WEIGHT} />
              )}
            </Button>
          ) : null}
          <Button
            href={pdfInlineUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={t("pdf_viewer_open_new_tab")}
          >
            <ArrowSquareOutIcon size={ICON_SIZE} weight={ICON_WEIGHT} />
          </Button>
          <Button
            href={pdfDownloadUrl}
            download
            variant="secondary"
            size="sm"
            iconLeft={<DownloadSimpleIcon size={ICON_SIZE} weight={ICON_WEIGHT} />}
          >
            {t("slideshow_download_pdf")}
          </Button>
        </div>
      </div>

      <div className={styles.stageWrap}>
        <div
          ref={stageRef}
          className={`${styles.stage} ${isGrabbing ? styles.grabbing : ""}`}
          style={stageStyle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPan}
          onPointerCancel={endPan}
        >
          {hasError ? (
            <div className={styles.errorState} role="alert">
              <p>{t("error_loading_pdf")}</p>
            </div>
          ) : (
            <>
              {showPlaceholder ? (
                <div className={styles.placeholder}>
                  {/* Real first page (fast WebP), A4-centered and sized to match
                      the fit-to-page canvas so the swap has no layout shift. */}
                  {!placeholderError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pageImageUrl(1, "full")}
                      alt={`${t("pdf_viewer_label")} — 1 / ${pageCount}`}
                      className={`${styles.placeholderImg} ${
                        placeholderImgLoaded ? styles.placeholderImgLoaded : ""
                      }`}
                      draggable={false}
                      fetchPriority="high"
                      onLoad={() => setPlaceholderImgLoaded(true)}
                      onError={() => setPlaceholderError(true)}
                    />
                  ) : null}
                  {/* Full-stage shimmer, fades out once the page image loads. */}
                  <div
                    className={styles.shimmer}
                    data-loaded={placeholderImgLoaded}
                    aria-hidden="true"
                  />
                  {!placeholderImgLoaded ? (
                    <div className={styles.loadingBadge}>
                      <Spinner size={40} />
                      <span className={styles.loadingLabel}>
                        {t("pdf_viewer_loading")}
                      </span>
                    </div>
                  ) : null}
                  <span className={styles.srOnly}>{t("pdf_viewer_loading")}</span>
                </div>
              ) : null}
              <div className={styles.pageBox} hidden={showPlaceholder}>
                <canvas
                  ref={canvasRef}
                  className={styles.canvas}
                  aria-label={`${t("pdf_viewer_label")} — ${currentPage} / ${pageCount}`}
                  role="img"
                />
              </div>
            </>
          )}
        </div>
        {isRendering && firstRenderReady && !hasError ? (
          <div className={styles.overlay} aria-hidden="true">
            <Spinner size={36} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** Spinning Phosphor spinner used for the loading and page-transition states. */
const Spinner = ({ size = 40 }: { size?: number }) => (
  <SpinnerGapIcon
    className={styles.spinner}
    size={size}
    weight="bold"
    aria-hidden="true"
  />
);

export default OfferPdfViewer;
