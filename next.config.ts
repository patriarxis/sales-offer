import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the native canvas binary and pdf.js out of the bundler; load them from
  // node_modules at runtime in the Node.js server routes.
  serverExternalPackages: ["@napi-rs/canvas", "pdfjs-dist"],

  // The offer templates and the Unicode font are read from disk at runtime.
  // On Vercel, only files the tracer knows about are shipped in the lambda, so
  // include them explicitly for the routes that read them.
  outputFileTracingIncludes: {
    "/[[...locale]]": ["./src/assets/offers/**"],
    "/api/offer/page": ["./src/assets/offers/**", "./src/assets/fonts/**"],
    "/api/offer/pdf": ["./src/assets/offers/**", "./src/assets/fonts/**"],
    "/assets/[...path]": ["./src/assets/**"],
  },

  async headers() {
    const robotsTag = {
      key: "X-Robots-Tag",
      value:
        "none, noindex, nofollow, noarchive, nosnippet, noimageindex, nocache, notranslate, nositelinkssearchbox, noai, noimageai, max-snippet:0, max-image-preview:none, max-video-preview:0",
    };

    return [
      { source: "/", headers: [robotsTag] },
      { source: "/:path*", headers: [robotsTag] },
    ];
  },
};

export default nextConfig;
