import { NextRequest, NextResponse } from "next/server";
import { locales } from "@/lib/i18n/config";
import type { Locale, OfferData } from "@/features/offer/model/offer.types";
import {
  computeOfferPdfHash,
  resolveOfferPdfSource,
} from "@/features/offer/server/offerBookletManifest";
import {
  getOfferPageData,
  OfferPageDataError,
} from "@/features/offer/server/getOfferPageData";
import {
  isPageVariant,
  OfferPageOutOfRangeError,
  renderOfferPdfPage,
} from "@/features/offer/server/rasterizeOfferPdf";

export const runtime = "nodejs";
// Cold rasterization of a large brochure fits comfortably; give it headroom.
export const maxDuration = 60;

const IMMUTABLE_CACHE =
  "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400, immutable";
const NO_STORE = "private, no-store";

// Dedupe the multi-page burst on a warm instance so we don't re-load offer
// fixtures once per page. Short-lived; the durable cache is the CDN.
const OFFER_TTL_MS = 60_000;
const offerDataCache = new Map<string, { data: OfferData; expires: number }>();

const getOfferDataCached = async (token: string): Promise<OfferData> => {
  const now = Date.now();
  const cached = offerDataCache.get(token);
  if (cached && cached.expires > now) {
    return cached.data;
  }
  const { offerData } = await getOfferPageData(token);
  offerDataCache.set(token, { data: offerData, expires: now + OFFER_TTL_MS });
  return offerData;
};

const errorResponse = (status: number) =>
  new NextResponse(null, { status, headers: { "Cache-Control": NO_STORE } });

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token = searchParams.get("t");
  const localeParam = searchParams.get("l");
  const variantParam = searchParams.get("s") ?? "full";
  const pageParam = searchParams.get("p");
  const hash = searchParams.get("v");

  if (
    !token ||
    !hash ||
    !localeParam ||
    !(locales as readonly string[]).includes(localeParam)
  ) {
    return errorResponse(400);
  }
  const locale = localeParam as Locale;
  if (!isPageVariant(variantParam)) {
    return errorResponse(400);
  }
  const page = Number(pageParam);
  if (!Number.isInteger(page) || page < 1) {
    return errorResponse(400);
  }

  let offerData: OfferData;
  try {
    offerData = await getOfferDataCached(token);
  } catch (error) {
    // Invalid/expired token or upstream failure — never cache these.
    const status = error instanceof OfferPageDataError ? 404 : 502;
    return errorResponse(status);
  }

  const source = resolveOfferPdfSource(offerData, locale);
  if (!source) {
    return errorResponse(404);
  }

  // Integrity: the hash in the URL must match the current offer content, or the
  // CDN could cache this content under a stale key. Mismatch → tell the client
  // to refetch rather than poisoning the cache.
  if (computeOfferPdfHash(source) !== hash) {
    return errorResponse(409);
  }

  try {
    const { buffer, contentType } = await renderOfferPdfPage({
      relativePath: source.relativePath,
      fields: source.fields,
      page,
      variant: variantParam,
      hash,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": IMMUTABLE_CACHE,
      },
    });
  } catch (error) {
    if (error instanceof OfferPageOutOfRangeError) {
      return errorResponse(404);
    }
    console.error("Offer page render error:", error);
    return errorResponse(500);
  }
}
