import type { Pricing } from "@/features/offer/model/offer.types";
import {
  findEntry,
  formatPricingValue,
  matchesKey,
  mergePricingByKey,
} from "@/features/offer/lib/pricingBuilderUtils";

export { mergePricingByKey };

/** PDF row order for FlexOne Commission (excludes unloading fields not on offer PDF). */
export const FLEXONE_COMMISSION_DISPLAY_KEYS = [
  "flexOneCommissionOrderValue",
  "flexOneCommissionServiceCost",
  "flexOneCommissionDigitalCardIssuanceCost",
  "flexOneCommissionPhysicalCardIssuanceCost",
  "flexOneCommissionCardProcedureCost",
  "flexOneCommissionCardReissuanceCost",
  "flexOneCommissionCardShippingCost",
] as const;

const isOrderValueTypeKey = (key: string): boolean =>
  /flexonecommissionordervaluetype/i.test(key);

const isExcludedCommissionKey = (key: string): boolean =>
  /cardunloading|corporateaccountunloading/i.test(key);

export const buildFlexOneCommissionPricing = (
  row: Record<string, unknown>,
): Pricing[] => {
  const pricing: Pricing[] = [];

  for (const expectedKey of FLEXONE_COMMISSION_DISPLAY_KEYS) {
    const entry = findEntry(row, (key) => matchesKey(key, expectedKey));
    if (!entry) {
      continue;
    }

    const [, value] = entry;
    pricing.push({
      key: expectedKey,
      category: expectedKey === "flexOneCommissionOrderValue" ? "Order Value" : expectedKey,
      monthly: formatPricingValue(expectedKey, value),
    });
  }

  return pricing;
};

export const isFlexOneCommissionPricingKey = (key: string): boolean => {
  if (!/^flexonecommission/i.test(key) || isExcludedCommissionKey(key)) {
    return false;
  }

  if (isOrderValueTypeKey(key)) {
    return false;
  }

  return FLEXONE_COMMISSION_DISPLAY_KEYS.some((allowed) =>
    matchesKey(key, allowed),
  );
};
