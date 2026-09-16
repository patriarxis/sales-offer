import type { Pricing } from "@/features/offer/model/offer.types";
import {
  findByAliases,
  matchesKey,
  pushPricingRow,
} from "@/features/offer/lib/pricingBuilderUtils";

type FieldDef = {
  outputKey: string;
  aliases: readonly string[];
};

const buildFromFieldDefs = (
  row: Record<string, unknown>,
  fields: readonly FieldDef[],
): Pricing[] => {
  const pricing: Pricing[] = [];

  for (const field of fields) {
    const entry = findByAliases(row, field.aliases);
    if (entry) {
      pushPricingRow(pricing, field.outputKey, entry[1]);
    }
  }

  return pricing;
};

/** Chèque Déjeuner PDF: order value, service value, shipping, late return. */
export const CHEQUE_DEJEUNER_DISPLAY_KEYS = [
  "chequeDejeunerBudget",
  "chequeDejeunerCommission",
  "chequeDejeunerCourierFees",
  "chequeDejeunerCostOfLateReturn",
] as const;

export const buildChequeDejeunerPricing = (
  row: Record<string, unknown>,
): Pricing[] =>
  buildFromFieldDefs(row, [
    {
      outputKey: "chequeDejeunerBudget",
      aliases: [
        "chequeDejeunerBudget",
        "chequeDejeunerOrderValue",
        "chequeOrderValue",
      ],
    },
    {
      outputKey: "chequeDejeunerCommission",
      aliases: [
        "chequeDejeunerCommission",
        "chequeDejeunerServiceValue",
        "chequeServiceValue",
      ],
    },
    {
      outputKey: "chequeDejeunerCourierFees",
      aliases: [
        "chequeDejeunerCourierFees",
        "chequeDejeunerShippingCost",
        "chequeShippingCost",
      ],
    },
    {
      outputKey: "chequeDejeunerCostOfLateReturn",
      aliases: ["chequeDejeunerCostOfLateReturn"],
    },
  ]);

/** Merchant meal acceptance: commission, yearly subscription, cashback. */
export const MERCHANT_MEAL_DISPLAY_KEYS = [
  "goForEatMerchantCommission",
  "goForEatMerchantYearlySubscription",
  "cashback",
] as const;

export const buildMerchantMealPricing = (row: Record<string, unknown>): Pricing[] =>
  buildFromFieldDefs(row, [
    {
      outputKey: "goForEatMerchantCommission",
      aliases: [
        "goForEatMerchantCommission",
        "goForEatCommission",
        "merchantGoForEatCommission",
      ],
    },
    {
      outputKey: "goForEatMerchantYearlySubscription",
      aliases: [
        "goForEatMerchantYearlySubscription",
        "goForEatYearlySubscription",
        "goForEATYearlySubscription",
        "merchantGoForEatYearlySubscription",
      ],
    },
    {
      outputKey: "cashback",
      aliases: [
        "cashback",
        "merchantCashbackCampaign",
        "cashbackCampaign",
      ],
    },
  ]);

/** Merchant non-meal acceptance: gift commission, yearly subscription, cashback. */
export const MERCHANT_NON_MEAL_DISPLAY_KEYS = [
  "merchantGiftCommission",
  "merchantGiftYearlySubscription",
  "cashback",
] as const;

export const buildMerchantNonMealPricing = (
  row: Record<string, unknown>,
): Pricing[] =>
  buildFromFieldDefs(row, [
    {
      outputKey: "merchantGiftCommission",
      aliases: [
        "merchantGiftCommission",
        "merchantUpGiftCommission",
        "mcaCardServiceValue",
        "mca_card_service_value",
        "upGiftCommission",
        "giftCommission",
      ],
    },
    {
      outputKey: "merchantGiftYearlySubscription",
      aliases: [
        "merchantGiftYearlySubscription",
        "merchantUpGiftYearlySubscription",
        "mcaYearlySubscription",
        "mca_yearly_subscription",
        "upGiftYearlySubscription",
        "giftYearlySubscription",
      ],
    },
    {
      outputKey: "cashback",
      aliases: [
        "cashback",
        "mcaCashbackCampaign",
        "mca_cashback_campaign",
        "merchantCashbackCampaign",
        "cashbackCampaign",
      ],
    },
  ]);

/** Merchant Fitpass acceptance: service value + VAT cost. */
export const MERCHANT_FITPASS_DISPLAY_KEYS = [
  "fitpassMerchantServiceValue",
  "fitpassMerchantServiceValueWithVatCost",
] as const;

export const buildMerchantFitpassPricing = (
  row: Record<string, unknown>,
): Pricing[] =>
  buildFromFieldDefs(row, [
    {
      outputKey: "fitpassMerchantServiceValue",
      aliases: [
        "fitpassMerchantServiceValue",
        "merchantFitpassServiceValue",
        "merchantFitPassServiceValue",
      ],
    },
    {
      outputKey: "fitpassMerchantServiceValueWithVatCost",
      aliases: [
        "fitpassMerchantServiceValueWithVatCost",
        "merchantFitpassServiceValueWithVatCost",
        "merchantFitpassServiceValueWithVATCost",
        "merchantFitPassServiceValueWithVatCost",
      ],
    },
  ]);

export const isChequeDejeunerPricingKey = (key: string): boolean =>
  CHEQUE_DEJEUNER_DISPLAY_KEYS.some((allowed) => matchesKey(key, allowed));

export const isMerchantMealPricingKey = (key: string): boolean =>
  MERCHANT_MEAL_DISPLAY_KEYS.some((allowed) => matchesKey(key, allowed));

export const isMerchantNonMealPricingKey = (key: string): boolean =>
  MERCHANT_NON_MEAL_DISPLAY_KEYS.some((allowed) => matchesKey(key, allowed));

export const isMerchantFitpassPricingKey = (key: string): boolean =>
  MERCHANT_FITPASS_DISPLAY_KEYS.some((allowed) => matchesKey(key, allowed));
