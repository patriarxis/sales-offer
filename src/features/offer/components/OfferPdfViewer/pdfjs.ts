"use client";

import type * as PdfjsModule from "pdfjs-dist";

type Pdfjs = typeof PdfjsModule;

let pdfjsPromise: Promise<Pdfjs> | null = null;

/**
 * Same-origin path to the pdf.js worker. It is served as a static file from
 * `public/` — copied there, version-matched to the installed `pdfjs-dist`, by
 * the `copy:pdf-worker` npm script (wired into predev/prebuild/postinstall).
 *
 * We deliberately do NOT resolve the worker through the bundler
 * (`new URL("pdfjs-dist/build/…", import.meta.url)`): `pdfjs-dist` is listed in
 * `serverExternalPackages` for the server rasterizer, and that external marking
 * collides with a bundled worker asset. A static file sidesteps the module
 * graph entirely and works identically across bundlers.
 */
const PDF_WORKER_SRC = "/pdf.worker.min.mjs";

/**
 * Lazily loads the browser build of pdf.js and points it at its web worker.
 *
 * The import is dynamic so the (heavy) renderer never lands in the initial
 * bundle and never runs on the server — this module is only ever reached from a
 * client effect. The result is memoized so the document viewer and any future
 * caller share a single pdf.js instance/worker.
 */
export const loadPdfjs = (): Promise<Pdfjs> => {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
      return pdfjs;
    });
  }
  return pdfjsPromise;
};
