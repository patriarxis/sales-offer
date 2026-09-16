import { PRODUCT_ID } from "@/enums/productId";
import type { Locale, OfferData } from "@/features/offer/model/offer.types";
import type { ProductId } from "@/types/domain/product";

export type OfferPdfTemplateConfig = {
  relativePath: string;
  /** Exact AcroForm field names present in the PDF. */
  fieldKeys: readonly string[];
};

const COMMENTS_FIELD = "comments";
const PAYMENT_TERMS_FIELD = "paymentTerms";

/**
 * Maps an AcroForm field name to the GetOfferData / OfferData source key.
 * When omitted, the AcroForm name is treated as the pricing key.
 */
const ACROFORM_SOURCE_KEYS: Record<string, string> = {
  // Chèque Déjeuner: API has one Product row → fill the first PDF row only
  chequeDejeunerBudget1: "chequeDejeunerBudget",
  chequeDejeunerCommission1: "chequeDejeunerCommission",
  chequeDejeunerCourierFees1: "chequeDejeunerCourierFees",
  chequeDejeunerCostOfLateReturn1: "chequeDejeunerCostOfLateReturn",
  paymentTerms1: PAYMENT_TERMS_FIELD,

  // Core / Rewards / Gift: per-row payment cells (filled only when that row has data)
  goForEatPaymentTerms: PAYMENT_TERMS_FIELD,
  goForEatDigitalPaymentTerms: PAYMENT_TERMS_FIELD,
  giftPaymentTerms: PAYMENT_TERMS_FIELD,
  giftDigitalPaymentTerms: PAYMENT_TERMS_FIELD,

  // Rewards / Gift / Core: prefer new Issuance Cost keys, fall back to legacy Card Issue Fees
  giftCardIssueFees: "giftIssuanceCost",
  goForEatCardIssueFees: "goForEatIssuanceCost",

  // Merchant Non-Meal AcroForms → GetOfferData Product keys
  merchantsNonMealCardServiceValue: "merchantGiftCommission",
  merchantsNonMealYearlySubscription: "merchantGiftYearlySubscription",
  merchantsNonMealCashbackCampaign: "cashback",

  // Merchant Meal AcroForms → GetOfferData Product keys
  merchantsMealChequeDejeunerServiceValue: "goForEatMerchantCommission",
  merchantsMealYearlySubscription: "goForEatMerchantYearlySubscription",
  merchantsMealCashbackCampaign: "cashback",
};

/**
 * Secondary pricing keys tried when the primary ACROFORM_SOURCE_KEYS value
 * (or the AcroForm name itself) is missing from OfferData.pricing.
 */
const ACROFORM_SOURCE_FALLBACKS: Record<string, readonly string[]> = {
  giftCardIssueFees: ["giftCardIssueFees"],
  goForEatCardIssueFees: ["goForEatCardIssueFees"],
};

/**
 * Payment-term AcroForm fields that should only be filled when at least one
 * related pricing key on that product row has a real positive value.
 */
const PAYMENT_TERMS_ROW_GATES: Record<string, readonly string[]> = {
  paymentTerms1: [
    "chequeDejeunerBudget",
    "chequeDejeunerCommission",
    "chequeDejeunerCourierFees",
    "chequeDejeunerCostOfLateReturn",
  ],
  goForEatPaymentTerms: [
    "goForEatBudget",
    "goForEatCommission",
    "goForEatIssuanceCost",
    "goForEatCardIssueFees",
    "goForEatReissuanceCost",
    "goForEatCourierFees",
  ],
  goForEatDigitalPaymentTerms: [
    "goForEatDigitalCommission",
    "goForEatDigitalCardIssueFees",
    "goForEatDigitalReissuanceCost",
  ],
  giftPaymentTerms: [
    "giftBudget",
    "giftCommission",
    "giftIssuanceCost",
    "giftCardIssueFees",
    "giftReissuanceCost",
    "giftCourierFees",
  ],
  giftDigitalPaymentTerms: [
    "giftDigitalCommission",
    "giftDigitalCardIssueFees",
    "giftDigitalReissuanceCost",
  ],
};

const CHEQUE_DEJEUNER_FIELDS = [
  "chequeDejeunerBudget1",
  "chequeDejeunerCommission1",
  "chequeDejeunerCourierFees1",
  "chequeDejeunerCostOfLateReturn1",
  "paymentTerms1",
  COMMENTS_FIELD,
] as const;

const CORE_OFFER_FIELDS = [
  "goForEatBudget",
  "goForEatCommission",
  "goForEatCardIssueFees",
  "goForEatCourierFees",
  "goForEatPaymentTerms",
  "goForEatDigitalCommission",
  "goForEatDigitalCardIssueFees",
  "goForEatDigitalPaymentTerms",
  "giftBudget",
  "giftCommission",
  "giftCardIssueFees",
  "giftCourierFees",
  "giftPaymentTerms",
  "giftDigitalCommission",
  "giftDigitalCardIssueFees",
  "giftDigitalPaymentTerms",
  COMMENTS_FIELD,
] as const;

/** Rewards / Gift PDFs: digital order value + shipping are static dashes (no AcroForms). */
const GIFT_ONLY_OFFER_FIELDS = [
  "giftBudget",
  "giftCommission",
  "giftCardIssueFees",
  "giftCourierFees",
  "giftPaymentTerms",
  "giftDigitalCommission",
  "giftDigitalCardIssueFees",
  "giftDigitalPaymentTerms",
  COMMENTS_FIELD,
] as const;

const FLEXONE_SUBSCRIPTION_FIELDS = [
  "flexPlusOrderValue",
  "flexMaxOrderValue",
  "flexPlusSubscriptionCost",
  "flexMaxSubscriptionCost",
  "flexPlusPhysicalCardIssuanceCost",
  "flexMaxPhysicalCardIssuanceCost",
  "flexPlusCardReissuanceCost",
  "flexMaxCardReissuanceCost",
  "flexPlusSubscriptionCardProcedure",
  "flexMaxSubscriptionCardProcedure",
  "flexPlusCardShippingCost",
  "flexMaxCardShippingCost",
  PAYMENT_TERMS_FIELD,
  COMMENTS_FIELD,
] as const;

const FLEXONE_COMMISSION_FIELDS = [
  "flexOneCommissionOrderValue",
  "flexOneCommissionServiceCost",
  "flexOneCommissionCardIssuanceCost",
  "flexOneCommissionCardReissuanceCost",
  "flexOneCommissionCardProcedureCost",
  "flexOneCommissionCardShippingCost",
  PAYMENT_TERMS_FIELD,
  COMMENTS_FIELD,
] as const;

const EXPENSE_FIELDS = [COMMENTS_FIELD] as const;

const FITPASS_FIELDS = [
  "fitpassCostValueRange1",
  "fitpassCostValueRange2",
  "fitpassCostValueRange3",
  "fitpassCostValueRange4",
  "fitpassCostValueRange5",
  "fitpassCostValueRange6",
  COMMENTS_FIELD,
] as const;

const MERCHANT_NON_MEAL_FIELDS = [
  "merchantsNonMealCardServiceValue",
  "merchantsNonMealYearlySubscription",
  "merchantsNonMealCashbackCampaign",
] as const;

const MERCHANT_MEAL_FIELDS = [
  "merchantsMealCardServiceValue",
  "merchantsMealChequeDejeunerServiceValue",
  "merchantsMealYearlySubscription",
  "merchantsMealCashbackCampaign",
] as const;

const MERCHANT_FITPASS_FIELDS = ["fitpassMerchantServiceValue"] as const;

const CORE_OFFER_TEMPLATE: OfferPdfTemplateConfig = {
  relativePath: "offers/Core-Offer-GR.pdf",
  fieldKeys: CORE_OFFER_FIELDS,
};

const REWARDS_OFFER_TEMPLATE: OfferPdfTemplateConfig = {
  relativePath: "offers/Rewards-Offer-GR.pdf",
  fieldKeys: GIFT_ONLY_OFFER_FIELDS,
};

const GIFT_OFFER_TEMPLATE: OfferPdfTemplateConfig = {
  relativePath: "offers/Up-Gift-Offer-GR.pdf",
  fieldKeys: GIFT_ONLY_OFFER_FIELDS,
};

export const OFFER_PDF_TEMPLATES: Partial<
  Record<ProductId, Partial<Record<Locale, OfferPdfTemplateConfig>>>
> = {
  [PRODUCT_ID.EXPENSE]: {
    el: {
      relativePath: "offers/Up-Expense-Offer-GR.pdf",
      fieldKeys: EXPENSE_FIELDS,
    },
  },
  [PRODUCT_ID.FITPASS]: {
    el: {
      relativePath: "offers/Fitpass-Offer-GR.pdf",
      fieldKeys: FITPASS_FIELDS,
    },
  },
  [PRODUCT_ID.GO_FOR_EAT_AND_GIFT]: {
    el: CORE_OFFER_TEMPLATE,
  },
  [PRODUCT_ID.REWARDS]: {
    el: REWARDS_OFFER_TEMPLATE,
  },
  [PRODUCT_ID.GIFT]: {
    el: GIFT_OFFER_TEMPLATE,
  },
  [PRODUCT_ID.CHEQUE_DEJEUNER]: {
    el: {
      relativePath: "offers/Chèque-Déjeuner-Offer-GR.pdf",
      fieldKeys: CHEQUE_DEJEUNER_FIELDS,
    },
  },
  [PRODUCT_ID.MERCHANT_MEAL_ACCEPTANCE]: {
    el: {
      relativePath: "offers/Merchants-Meal-Offer-GR.pdf",
      fieldKeys: MERCHANT_MEAL_FIELDS,
    },
  },
  [PRODUCT_ID.MERCHANT_NON_MEAL_ACCEPTANCE]: {
    el: {
      relativePath: "offers/Merchants-Non-Meal-Offer-GR.pdf",
      fieldKeys: MERCHANT_NON_MEAL_FIELDS,
    },
  },
  [PRODUCT_ID.MERCHANT_FITPASS_ACCEPTANCE]: {
    el: {
      relativePath: "offers/Merchants-Fitpass-Offer-GR.pdf",
      fieldKeys: MERCHANT_FITPASS_FIELDS,
    },
  },
  [PRODUCT_ID.FLEXONE_SUBSCRIPTION]: {
    el: {
      relativePath: "offers/FlexOne-Offer-Subscription-GR.pdf",
      fieldKeys: FLEXONE_SUBSCRIPTION_FIELDS,
    },
  },
  [PRODUCT_ID.FLEXONE_COMMISSION]: {
    el: {
      relativePath: "offers/FlexOne-Offer-Commisssion-GR.pdf",
      fieldKeys: FLEXONE_COMMISSION_FIELDS,
    },
  },
};

export const getOfferPdfTemplate = (
  offerData: OfferData,
  locale: Locale,
): OfferPdfTemplateConfig | null => {
  const byLocale = OFFER_PDF_TEMPLATES[offerData.productId];
  if (!byLocale) {
    return null;
  }

  // Temporary: EN templates are not ready — reuse the GR fillable form for all locales.
  return byLocale[locale] ?? byLocale.el ?? null;
};

const PRICING_FIELD_MATCHERS: Partial<
  Record<string, (keyAndCategory: string) => boolean>
> = {
  flexPlusOrderValue: (value) => /flexplus(ordervalue|budget)/i.test(value),
  flexMaxOrderValue: (value) => /flexmax(ordervalue|budget)/i.test(value),
};

const resolveSourceKey = (fieldKey: string): string =>
  ACROFORM_SOURCE_KEYS[fieldKey] ?? fieldKey;

const resolvePricingSourceKeys = (fieldKey: string): readonly string[] => {
  const primary = resolveSourceKey(fieldKey);
  const fallbacks = ACROFORM_SOURCE_FALLBACKS[fieldKey] ?? [];
  return [primary, ...fallbacks.filter((key) => key.toLowerCase() !== primary.toLowerCase())];
};

const findPricingMonthly = (
  pricing: OfferData["products"][number]["pricing"],
  sourceKeys: readonly string[],
): string | null => {
  for (const sourceKey of sourceKeys) {
    const matcher = PRICING_FIELD_MATCHERS[sourceKey];
    const row = pricing.find(
      (entry) =>
        entry.key?.toLowerCase() === sourceKey.toLowerCase() ||
        matcher?.(`${entry.key ?? ""} ${entry.category}`),
    );
    const value = row?.monthly?.trim();
    if (value && value !== "-") {
      return value;
    }
  }
  return null;
};

const parsePricingAmount = (monthly: string): number => {
  const numeric = monthly
    .replace(/[^0-9,.-]/g, "")
    .replace(/\.(?=\d{3})/g, "")
    .replace(",", ".");
  const parsed = Number.parseFloat(numeric);
  return Number.isFinite(parsed) ? parsed : 0;
};

const hasMeaningfulPricingKey = (
  pricing: OfferData["products"][number]["pricing"],
  keys: readonly string[],
): boolean =>
  pricing.some(
    (row) =>
      Boolean(row.key) &&
      keys.some((key) => row.key!.toLowerCase() === key.toLowerCase()) &&
      parsePricingAmount(row.monthly) > 0,
  );

const getLocalizedFieldValue = (
  offerData: OfferData,
  locale: Locale,
  sourceKey: string,
): string | null => {
  if (sourceKey === COMMENTS_FIELD) {
    return offerData.localized[locale].comments;
  }
  if (sourceKey === PAYMENT_TERMS_FIELD) {
    return offerData.localized[locale].paymentTerms;
  }
  return null;
};

/** PDF "Έκδοση Κάρτας" — single amount from digital + physical (max if they differ). */
const FLEXONE_COMMISSION_CARD_ISSUANCE_FIELD = "flexOneCommissionCardIssuanceCost";

/** FlexOne Subscription PDF issuance cells: max(digital, physical) per plan. */
const FLEXONE_SUBSCRIPTION_CARD_ISSUANCE_SOURCES: Record<
  string,
  readonly [string, string]
> = {
  flexPlusPhysicalCardIssuanceCost: [
    "flexPlusDigitalCardIssuanceCost",
    "flexPlusPhysicalCardIssuanceCost",
  ],
  flexMaxPhysicalCardIssuanceCost: [
    "flexMaxDigitalCardIssuanceCost",
    "flexMaxPhysicalCardIssuanceCost",
  ],
};

const pickMaxPricingMonthly = (
  pricing: OfferData["products"][number]["pricing"],
  keys: readonly string[],
): string | null => {
  let best: { amount: number; monthly: string } | null = null;

  for (const key of keys) {
    const row = pricing.find(
      (entry) => entry.key?.toLowerCase() === key.toLowerCase(),
    );
    const monthly = row?.monthly?.trim();
    if (!monthly || monthly === "-") {
      continue;
    }

    const amount = parsePricingAmount(monthly);
    if (!best || amount > best.amount) {
      best = { amount, monthly };
    }
  }

  return best?.monthly ?? null;
};

export const getOfferPdfFieldValues = (
  offerData: OfferData,
  locale: Locale,
  fieldKeys: readonly string[],
): Record<string, string> => {
  const pricing = offerData.products.flatMap((product) => product.pricing);
  const values: Record<string, string> = {};

  for (const fieldKey of fieldKeys) {
    if (fieldKey === FLEXONE_COMMISSION_CARD_ISSUANCE_FIELD) {
      const issuanceCost = pickMaxPricingMonthly(pricing, [
        "flexOneCommissionDigitalCardIssuanceCost",
        "flexOneCommissionPhysicalCardIssuanceCost",
      ]);
      if (issuanceCost) {
        values[fieldKey] = issuanceCost;
      }
      continue;
    }

    const subscriptionIssuanceSources =
      FLEXONE_SUBSCRIPTION_CARD_ISSUANCE_SOURCES[fieldKey];
    if (subscriptionIssuanceSources) {
      const issuanceCost = pickMaxPricingMonthly(
        pricing,
        subscriptionIssuanceSources,
      );
      if (issuanceCost) {
        values[fieldKey] = issuanceCost;
      }
      continue;
    }

    const sourceKey = resolveSourceKey(fieldKey);
    const paymentTermsGate = PAYMENT_TERMS_ROW_GATES[fieldKey];

    if (
      paymentTermsGate &&
      !hasMeaningfulPricingKey(pricing, paymentTermsGate)
    ) {
      continue;
    }

    const localizedValue = getLocalizedFieldValue(offerData, locale, sourceKey);
    const normalizedLocalizedValue = localizedValue?.trim();
    if (normalizedLocalizedValue && normalizedLocalizedValue !== "-") {
      values[fieldKey] = normalizedLocalizedValue;
      continue;
    }

    const value = findPricingMonthly(pricing, resolvePricingSourceKeys(fieldKey));
    if (value) {
      values[fieldKey] = value;
    }
  }

  return values;
};

export const shouldFillOfferPdf = (
  offerData: OfferData,
  locale: Locale,
): boolean => Boolean(getOfferPdfTemplate(offerData, locale));
