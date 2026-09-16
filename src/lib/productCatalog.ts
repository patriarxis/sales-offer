import chequeDejeunerLogo from "@/assets/product-logos/cheque-dejeuner-logo.webp";
import fitpassLogo from "@/assets/product-logos/fitpass-logo.svg";
import flexoneLogo from "@/assets/product-logos/flexone-logo.webp";
import goForEatLogo from "@/assets/product-logos/go-for-eat-logo.svg";
import merchantFitpassLogo from "@/assets/product-logos/merchant-fitpass.webp";
import merchantShopLogo from "@/assets/product-logos/merchant-shop.webp";
import upExpenseLogo from "@/assets/product-logos/up-expense-logo.svg";
import upGiftLogo from "@/assets/product-logos/up-gift-logo.svg";
import { PRODUCT_ID } from "@/enums/productId";
import { ProductDefinition, ProductId } from "@/types/domain/product";

const offerPdf = (filename: string): string =>
  `/assets/offers/${encodeURIComponent(filename)}`;

/**
 * Temporary: EN offer PDFs are not ready yet, so both locales reuse the GR
 * booklet. Swap `en` to a dedicated EN file when those templates ship.
 */
const offerPdfUrls = (grFilename: string) => {
  const url = offerPdf(grFilename);
  return { el: url, en: url };
};

export const PRODUCT_CATALOG: ProductDefinition[] = [
  {
    id: PRODUCT_ID.EXPENSE,
    displayName: "Up Expense",
    logo: { src: upExpenseLogo, alt: "Up Expense" },
    pdfUrl: offerPdfUrls("Up-Expense-Offer-GR.pdf"),
  },
  {
    id: PRODUCT_ID.FITPASS,
    displayName: "Fitpass",
    logo: { src: fitpassLogo, alt: "Fitpass" },
    pdfUrl: offerPdfUrls("Fitpass-Offer-GR.pdf"),
  },
  {
    id: PRODUCT_ID.GO_FOR_EAT_AND_GIFT,
    displayName: "Go For Eat & Gift",
    logo: { src: goForEatLogo, alt: "Go For Eat & Gift" },
    pdfUrl: offerPdfUrls("Core-Offer-GR.pdf"),
  },
  {
    id: PRODUCT_ID.CHEQUE_DEJEUNER,
    displayName: "Chèque Déjeuner",
    logo: { src: chequeDejeunerLogo, alt: "Chèque Déjeuner" },
    pdfUrl: offerPdfUrls("Chèque-Déjeuner-Offer-GR.pdf"),
  },
  {
    id: PRODUCT_ID.MERCHANT_MEAL_ACCEPTANCE,
    displayName: "Merchant Meal Acceptance",
    logo: { src: merchantShopLogo, alt: "Merchant Meal Acceptance" },
    pdfUrl: offerPdfUrls("Merchants-Meal-Offer-GR.pdf"),
  },
  {
    id: PRODUCT_ID.MERCHANT_NON_MEAL_ACCEPTANCE,
    displayName: "Merchant Non-Meal Acceptance",
    logo: { src: merchantShopLogo, alt: "Merchant Non-Meal Acceptance" },
    pdfUrl: offerPdfUrls("Merchants-Non-Meal-Offer-GR.pdf"),
  },
  {
    id: PRODUCT_ID.MERCHANT_FITPASS_ACCEPTANCE,
    displayName: "Merchant Fitpass Acceptance",
    logo: { src: merchantFitpassLogo, alt: "Merchant Fitpass Acceptance" },
    pdfUrl: offerPdfUrls("Merchants-Fitpass-Offer-GR.pdf"),
  },
  {
    id: PRODUCT_ID.FLEXONE_SUBSCRIPTION,
    displayName: "FlexOne Subscription",
    logo: { src: flexoneLogo, alt: "FlexOne" },
    pdfUrl: offerPdfUrls("FlexOne-Offer-Subscription-GR.pdf"),
  },
  {
    id: PRODUCT_ID.FLEXONE_COMMISSION,
    displayName: "FlexOne Commission",
    logo: { src: flexoneLogo, alt: "FlexOne" },
    pdfUrl: offerPdfUrls("FlexOne-Offer-Commisssion-GR.pdf"),
  },
  {
    id: PRODUCT_ID.REWARDS,
    displayName: "Rewards",
    logo: { src: upGiftLogo, alt: "Up Gift" },
    pdfUrl: offerPdfUrls("Rewards-Offer-GR.pdf"),
  },
  {
    id: PRODUCT_ID.GIFT,
    displayName: "Up Gift",
    logo: { src: upGiftLogo, alt: "Up Gift" },
    pdfUrl: offerPdfUrls("Up-Gift-Offer-GR.pdf"),
  },
];

export const OFFER_TYPE_VALUE_TO_PRODUCT_ID: Record<number, PRODUCT_ID> = {
  0: PRODUCT_ID.EXPENSE,
  1: PRODUCT_ID.FITPASS,
  2: PRODUCT_ID.GO_FOR_EAT_AND_GIFT,
  3: PRODUCT_ID.CHEQUE_DEJEUNER,
  4: PRODUCT_ID.MERCHANT_MEAL_ACCEPTANCE,
  5: PRODUCT_ID.MERCHANT_NON_MEAL_ACCEPTANCE,
  6: PRODUCT_ID.MERCHANT_FITPASS_ACCEPTANCE,
  7: PRODUCT_ID.FLEXONE_SUBSCRIPTION,
  8: PRODUCT_ID.FLEXONE_COMMISSION,
  9: PRODUCT_ID.REWARDS,
  11: PRODUCT_ID.GIFT,
};

/**
 * Merchant/network offers (acceptance network) follow a "become our partner"
 * philosophy rather than a product sale, even though both still require
 * accepting/rejecting the offer.
 */
export const NETWORK_PRODUCT_IDS: ProductId[] = [
  PRODUCT_ID.MERCHANT_MEAL_ACCEPTANCE,
  PRODUCT_ID.MERCHANT_NON_MEAL_ACCEPTANCE,
  PRODUCT_ID.MERCHANT_FITPASS_ACCEPTANCE,
];

export const isNetworkProduct = (
  id: ProductId | string | undefined | null,
): boolean => Boolean(id && NETWORK_PRODUCT_IDS.includes(id as ProductId));

export const getProductById = (
  id: ProductId | string | undefined | null,
): ProductDefinition | null => {
  if (!id) {
    return null;
  }

  return PRODUCT_CATALOG.find((product) => product.id === id) ?? null;
};

/**
 * Resolves a product strictly from GetOfferData `offerTypeValue`.
 * Returns null when the value is missing, non-numeric, or not in the map —
 * callers must surface an error UI instead of falling back to another product.
 */
export const getProductByOfferTypeValue = (
  value: number | string | undefined | null,
): ProductDefinition | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  const id = OFFER_TYPE_VALUE_TO_PRODUCT_ID[numeric];
  return id ? getProductById(id) : null;
};
