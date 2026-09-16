"use client";

import { useEffect, useState } from "react";
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
} from "pdfjs-dist";
import { loadPdfjs } from "./pdfjs";

export type PdfDocStatus = "loading" | "ready" | "error";

export interface OfferPdfDocument {
  /** The parsed document, or null until it is ready. */
  doc: PDFDocumentProxy | null;
  /** pdf.js page count once ready; the manifest fallback before that. */
  pageCount: number;
  status: PdfDocStatus;
}

/**
 * Loads (and owns the lifecycle of) the offer PDF from the given URL with
 * pdf.js. Starts from a manifest-provided `fallbackPageCount` so the UI can show
 * "N / total" immediately, then switches to the document's real count on load.
 */
export const useOfferPdfDocument = (
  url: string,
  fallbackPageCount: number,
): OfferPdfDocument => {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(fallbackPageCount);
  const [status, setStatus] = useState<PdfDocStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    let task: PDFDocumentLoadingTask | null = null;
    let loaded: PDFDocumentProxy | null = null;

    setStatus("loading");
    setDoc(null);

    (async () => {
      try {
        const pdfjs = await loadPdfjs();
        if (cancelled) return;
        task = pdfjs.getDocument({ url, isEvalSupported: false });
        loaded = await task.promise;
        if (cancelled) {
          await loaded.destroy();
          return;
        }
        setDoc(loaded);
        setPageCount(loaded.numPages);
        setStatus("ready");
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load offer PDF:", error);
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      // Destroying the doc also tears down its loading task; if it never
      // resolved, destroy the task directly. Both reject in-flight work quietly.
      if (loaded) {
        void loaded.destroy();
      } else {
        void task?.destroy();
      }
    };
  }, [url]);

  return { doc, pageCount, status };
};
