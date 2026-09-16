import { NextRequest, NextResponse } from "next/server";
import { locales } from "@/lib/i18n/config";
import type { Locale } from "@/features/offer/model/offer.types";
import {
  fillOfferPdfTemplate,
  readOfferTemplateBytes,
} from "@/features/offer/server/fillOfferPdfTemplate";
import {
  getOfferPageData,
  OfferPageDataError,
} from "@/features/offer/server/getOfferPageData";
import { resolveOfferPdfSource } from "@/features/offer/server/offerBookletManifest";

export const runtime = "nodejs";

const sanitizeFields = (fields: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(fields).filter(
      ([key, value]) =>
        typeof key === "string" && typeof value === "string" && value.trim(),
    ),
  );

const asciiFilename = (raw: string): string =>
  raw.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "offer";

/**
 * GET — serves the original filled PDF for the customer/rep. Re-derives the
 * filled document from the offer token so the link needs no request body.
 *
 * `?inline=1` serves it with `Content-Disposition: inline` so the browser opens
 * it in its native PDF viewer ("Open in new tab" — free text selection, search,
 * print, full fidelity). Without it the PDF downloads as an attachment.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token = searchParams.get("t");
  const localeParam = searchParams.get("l");
  const inline = searchParams.get("inline") === "1";

  if (
    !token ||
    !localeParam ||
    !(locales as readonly string[]).includes(localeParam)
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const locale = localeParam as Locale;

  try {
    const { offerData } = await getOfferPageData(token);
    const source = resolveOfferPdfSource(offerData, locale);
    if (!source) {
      return NextResponse.json({ error: "No offer PDF" }, { status: 404 });
    }

    const bytes =
      Object.keys(source.fields).length > 0
        ? await fillOfferPdfTemplate(source.relativePath, source.fields)
        : await readOfferTemplateBytes(source.relativePath);

    const filename = asciiFilename(
      `offer-${offerData.offerDetails.refNumber || "document"}`,
    );

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const status = error instanceof OfferPageDataError ? 404 : 500;
    console.error("Download offer PDF error:", error);
    return NextResponse.json({ error: "Failed to build offer PDF" }, { status });
  }
}

/**
 * POST — fill an offer template from an explicit path + field values.
 * Retained for backward compatibility.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as {
      relativePath?: string;
      fields?: Record<string, string>;
    };

    const { relativePath, fields } = payload;

    if (!relativePath || typeof relativePath !== "string") {
      return NextResponse.json({ error: "Missing PDF template path" }, { status: 400 });
    }

    if (!fields || typeof fields !== "object") {
      return NextResponse.json({ error: "Missing PDF field values" }, { status: 400 });
    }

    const filledPdf = await fillOfferPdfTemplate(relativePath, sanitizeFields(fields));

    return new NextResponse(Buffer.from(filledPdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Fill offer PDF error:", error);
    return NextResponse.json({ error: "Failed to fill offer PDF" }, { status: 500 });
  }
}
