import { createHash } from "node:crypto";
import {
  getOfferPdfFieldValues,
  getOfferPdfTemplate,
} from "@/features/offer/lib/offerPdfTemplates";
import type { Locale, OfferData } from "@/features/offer/model/offer.types";
import { isAllowedTemplatePath, readOfferTemplateMeta } from "./fillOfferPdfTemplate";

/**
 * Bump when the rasterization output changes (variant sizes, quality, engine)
 * so every previously-cached image URL is invalidated.
 */
const RASTER_VERSION = "r1";

const ASSET_OFFERS_PREFIX = "/assets/offers/";

export interface OfferPdfSource {
  /** Validated `offers/<name>.pdf` template path. */
  relativePath: string;
  /** Flattened AcroForm field values (empty when the product has no form). */
  fields: Record<string, string>;
}

/**
 * The single source of truth for "which template + which field values back this
 * offer's booklet". Used by the offer page (to build the manifest hash) and by
 * the image route (to fill + rasterize), so the two always agree.
 */
export const resolveOfferPdfSource = (
  offerData: OfferData,
  locale: Locale,
): OfferPdfSource | null => {
  const template = getOfferPdfTemplate(offerData, locale);
  if (template) {
    const rawFields = getOfferPdfFieldValues(
      offerData,
      locale,
      template.fieldKeys,
    );
    return {
      relativePath: template.relativePath,
      fields: sanitizeFields(rawFields),
    };
  }

  // No fillable template — rasterize the static brochure straight from its URL.
  const url =
    offerData.offerDetails.pdfUrl?.[locale] ?? offerData.offerDetails.pdfUrl?.el;
  if (!url || !url.startsWith(ASSET_OFFERS_PREFIX)) {
    return null;
  }

  const filename = decodeURIComponent(url.slice(ASSET_OFFERS_PREFIX.length));
  const relativePath = `offers/${filename}`;
  if (!isAllowedTemplatePath(relativePath)) {
    return null;
  }

  return { relativePath, fields: {} };
};

const sanitizeFields = (
  fields: Record<string, string>,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(fields).filter(
      ([key, value]) =>
        typeof key === "string" && typeof value === "string" && value.trim(),
    ),
  );

const stableStringify = (fields: Record<string, string>): string =>
  JSON.stringify(
    Object.keys(fields)
      .sort()
      .map((key) => [key, fields[key]]),
  );

/** Content hash identifying a filled document — drives immutable CDN caching. */
export const computeOfferPdfHash = (source: OfferPdfSource): string =>
  createHash("sha256")
    .update(RASTER_VERSION)
    .update("\0")
    .update(source.relativePath)
    .update("\0")
    .update(stableStringify(source.fields))
    .digest("hex")
    .slice(0, 16);

export interface OfferBookletManifest {
  /** Opaque offer bearer token (already present in the page URL). */
  token: string;
  locale: Locale;
  /** Content hash — pins image URLs so the CDN can cache them immutably. */
  hash: string;
  pageCount: number;
  /** First-page aspect ratio (width / height) for reserving layout space. */
  aspectRatio: number;
}

/**
 * Builds the small, serializable descriptor the client needs to render the
 * booklet: page count, aspect ratio, and the content hash. No PDF is filled
 * here — page count/dimensions come from the raw template — so it stays cheap
 * on the offer page's critical path.
 */
export const buildOfferBookletManifest = async (
  offerData: OfferData,
  locale: Locale,
  token: string,
): Promise<OfferBookletManifest | null> => {
  const source = resolveOfferPdfSource(offerData, locale);
  if (!source) {
    return null;
  }

  try {
    const meta = await readOfferTemplateMeta(source.relativePath);
    return {
      token,
      locale,
      hash: computeOfferPdfHash(source),
      pageCount: meta.pageCount,
      aspectRatio: meta.width / meta.height,
    };
  } catch {
    return null;
  }
};
