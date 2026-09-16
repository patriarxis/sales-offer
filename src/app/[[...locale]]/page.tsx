import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DemoBar, OfferScreen } from "@/features/offer/components";
import {
  DEV_ERROR_PREVIEW_SALES_PERSON,
  OFFER_LOAD_ERROR,
  OfferPageDataError,
  parseDevErrorPreview,
  showsSalesContact,
} from "@/features/offer/model/offerLoadError";
import { getOfferPageData } from "@/features/offer/server/getOfferPageData";
import { getDemoGalleryItems } from "@/features/offer/server/mockOffers";
import { buildOfferBookletManifest } from "@/features/offer/server/offerBookletManifest";
import { getServerLocale } from "@/lib/i18n/server";
import { LOCALE } from "@/enums/locale";
import { defaultLocale, locales } from "@/lib/i18n/config";
import { DemoGallery } from "@/screens/DemoGallery/DemoGallery";
import { OfferStatusScreen } from "@/screens/OfferStatusScreen/OfferStatusScreen";

interface HomeProps {
  params: Promise<{ locale?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const isValidLocaleSegment = (segment: string | undefined): boolean => {
  if (!segment) return true;
  if (segment === defaultLocale) return false;
  return (locales as readonly LOCALE[]).includes(segment as LOCALE);
};

export default async function Home({ params, searchParams }: HomeProps) {
  const { locale: segments } = await params;

  if (segments && (segments.length > 1 || !isValidLocaleSegment(segments[0]))) {
    notFound();
  }

  const sp = await searchParams;

  // Dev-only: /?errorPreview=EXPIRED_TOKEN (or any OfferLoadErrorCode)
  const errorPreview = parseDevErrorPreview(sp?.errorPreview);
  if (errorPreview) {
    return (
      <OfferStatusScreen
        reason={errorPreview}
        salesPerson={
          showsSalesContact(errorPreview) ? DEV_ERROR_PREVIEW_SALES_PERSON : null
        }
      />
    );
  }

  const offerToken = typeof sp?.offerToken === "string" ? sp.offerToken : null;

  if (!offerToken) {
    return (
      <Suspense fallback={null}>
        <DemoGallery items={getDemoGalleryItems()} />
      </Suspense>
    );
  }

  try {
    const { offerData } = await getOfferPageData(offerToken);
    const locale = await getServerLocale();
    const booklet = await buildOfferBookletManifest(
      offerData,
      locale,
      offerToken,
    );

    return (
      <Suspense fallback={null}>
        <DemoBar currentToken={offerToken} />
        <OfferScreen offerData={offerData} booklet={booklet} />
      </Suspense>
    );
  } catch (error) {
    console.error("Failed to load demo offer data.", error);

    if (error instanceof OfferPageDataError) {
      return (
        <>
          <DemoBar currentToken={offerToken} />
          <OfferStatusScreen
            reason={error.code}
            salesPerson={error.salesPerson}
          />
        </>
      );
    }

    return (
      <>
        <DemoBar currentToken={offerToken} />
        <OfferStatusScreen reason={OFFER_LOAD_ERROR.INVALID_LINK} />
      </>
    );
  }
}
