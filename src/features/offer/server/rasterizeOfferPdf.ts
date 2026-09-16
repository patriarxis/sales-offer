import { createRequire } from "node:module";
import path from "node:path";
import { createCanvas } from "@napi-rs/canvas";
import {
  fillOfferPdfTemplate,
  readOfferTemplateBytes,
} from "./fillOfferPdfTemplate";

/**
 * Server-side PDF → WebP rasterizer for the offer booklet.
 *
 * Approach A: instead of shipping a multi-MB PDF to the browser and rasterizing
 * every page client-side, we render each page to an optimized WebP here, once,
 * and let the CDN cache the result (see the `/api/offer/page` route). The client
 * only ever downloads small images.
 *
 * The rasterizer engine is isolated behind {@link renderOfferPdfPage} so it can
 * be swapped (e.g. for a WASM pdfium build) without touching callers.
 */

export type PageVariant = "full" | "thumb";

interface VariantConfig {
  /** Target render width in CSS pixels. */
  width: number;
  /** WebP quality (0–1). */
  quality: number;
}

const VARIANTS: Record<PageVariant, VariantConfig> = {
  // ~2.4x the 480px display box → crisp on retina without bloating bytes.
  full: { width: 1200, quality: 0.82 },
  // Tiny blur-up placeholder shown instantly while the full image loads.
  thumb: { width: 48, quality: 0.5 },
};

export const isPageVariant = (value: string): value is PageVariant =>
  value === "full" || value === "thumb";

export interface RenderOfferPdfPageInput {
  /** Validated `offers/<name>.pdf` template path. */
  relativePath: string;
  /** Flattened AcroForm field values (empty for templates without a form). */
  fields: Record<string, string>;
  /** 1-based page number. */
  page: number;
  variant: PageVariant;
  /** Stable content hash identifying this filled document (for caching). */
  hash: string;
}

export interface RenderedPage {
  buffer: Buffer;
  contentType: "image/webp";
}

// ---------------------------------------------------------------------------
// Warm-instance caches. These live for the lifetime of a serverless instance
// and simply avoid repeat work within a burst; the durable cache is the CDN.
// ---------------------------------------------------------------------------

class Lru<V> {
  private readonly map = new Map<string, V>();
  constructor(private readonly max: number) {}

  get(key: string): V | undefined {
    const value = this.map.get(key);
    if (value !== undefined) {
      this.map.delete(key);
      this.map.set(key, value);
    }
    return value;
  }

  set(key: string, value: V): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.max) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) {
        this.map.delete(oldest);
      }
    }
    this.map.set(key, value);
  }
}

// Filled PDF bytes keyed by content hash — reused across a document's pages.
const filledPdfCache = new Lru<Uint8Array>(6);
// Rendered images keyed by hash:page:variant.
const renderedPageCache = new Lru<Buffer>(64);

const filledPdfInFlight = new Map<string, Promise<Uint8Array>>();

const getFilledPdf = async (
  relativePath: string,
  fields: Record<string, string>,
  hash: string,
): Promise<Uint8Array> => {
  const cached = filledPdfCache.get(hash);
  if (cached) {
    return cached;
  }

  const existing = filledPdfInFlight.get(hash);
  if (existing) {
    return existing;
  }

  const promise = (async () => {
    const bytes =
      Object.keys(fields).length > 0
        ? await fillOfferPdfTemplate(relativePath, fields)
        : await readOfferTemplateBytes(relativePath);
    filledPdfCache.set(hash, bytes);
    return bytes;
  })().finally(() => {
    filledPdfInFlight.delete(hash);
  });

  filledPdfInFlight.set(hash, promise);
  return promise;
};

// ---------------------------------------------------------------------------
// pdf.js (Node build) — loaded lazily so it never touches the client bundle.
// ---------------------------------------------------------------------------

type PdfjsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
let pdfjsPromise: Promise<PdfjsModule> | null = null;

const getStandardFontDataUrl = (): string | undefined => {
  try {
    const require = createRequire(import.meta.url);
    const pkg = require.resolve("pdfjs-dist/package.json");
    return `${path.join(path.dirname(pkg), "standard_fonts")}${path.sep}`;
  } catch {
    return undefined;
  }
};

const loadPdfjs = (): Promise<PdfjsModule> => {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist/legacy/build/pdf.mjs");
  }
  return pdfjsPromise;
};

/** Number of pages in a filled offer document (used by the manifest builder). */
export const getOfferPdfPageCount = async (
  input: Pick<RenderOfferPdfPageInput, "relativePath" | "fields" | "hash">,
): Promise<number> => {
  const pdfjs = await loadPdfjs();
  const data = await getFilledPdf(input.relativePath, input.fields, input.hash);
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(data),
    isEvalSupported: false,
    disableFontFace: true,
  }).promise;
  const numPages = doc.numPages;
  await doc.destroy();
  return numPages;
};

export const renderOfferPdfPage = async (
  input: RenderOfferPdfPageInput,
): Promise<RenderedPage> => {
  const { relativePath, fields, page, variant, hash } = input;
  const cacheKey = `${hash}:${page}:${variant}`;

  const cached = renderedPageCache.get(cacheKey);
  if (cached) {
    return { buffer: cached, contentType: "image/webp" };
  }

  const pdfjs = await loadPdfjs();
  const data = await getFilledPdf(relativePath, fields, hash);

  const doc = await pdfjs.getDocument({
    data: new Uint8Array(data),
    isEvalSupported: false,
    disableFontFace: true,
    standardFontDataUrl: getStandardFontDataUrl(),
  }).promise;

  try {
    if (page < 1 || page > doc.numPages) {
      throw new OfferPageOutOfRangeError(page, doc.numPages);
    }

    const config = VARIANTS[variant];
    const pdfPage = await doc.getPage(page);
    const base = pdfPage.getViewport({ scale: 1 });
    const scale = config.width / base.width;
    const viewport = pdfPage.getViewport({ scale });

    const canvas = createCanvas(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height),
    );
    const context = canvas.getContext("2d");

    await pdfPage.render({
      // @napi-rs/canvas' 2D context satisfies pdf.js' canvas contract.
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport,
      canvas: canvas as unknown as HTMLCanvasElement,
    }).promise;

    const buffer = canvas.toBuffer("image/webp", config.quality);
    renderedPageCache.set(cacheKey, buffer);
    return { buffer, contentType: "image/webp" };
  } finally {
    await doc.destroy();
  }
};

export class OfferPageOutOfRangeError extends Error {
  constructor(
    readonly page: number,
    readonly pageCount: number,
  ) {
    super(`Requested page ${page} is out of range (1–${pageCount}).`);
    this.name = "OfferPageOutOfRangeError";
  }
}
