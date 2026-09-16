import { PRODUCT_ID } from "@/enums/productId";
import { isFlexOneCommissionPricingKey } from "@/features/offer/lib/flexOneCommissionPricing";
import {
  CHEQUE_DEJEUNER_DISPLAY_KEYS,
  isChequeDejeunerPricingKey,
  isMerchantFitpassPricingKey,
  isMerchantMealPricingKey,
  isMerchantNonMealPricingKey,
  MERCHANT_FITPASS_DISPLAY_KEYS,
  MERCHANT_MEAL_DISPLAY_KEYS,
  MERCHANT_NON_MEAL_DISPLAY_KEYS,
} from "@/features/offer/lib/productOfferPricing";
import type { Pricing } from "@/features/offer/model/offer.types";
import type { ProductId } from "@/types/domain/product";

type WhitelistRule = string | RegExp;

const matchRule = (rule: WhitelistRule, key: string): boolean => {
  if (typeof rule === "string") {
    return key.toLowerCase() === rule.toLowerCase();
  }
  return rule.test(key);
};

/** FlexOne subscription PDF: order value, monthly subscription, card costs, shipping. */
const FLEXONE_SUBSCRIPTION_RULES: WhitelistRule[] = [
  /^flex(Plus|Max)OrderValue$/i,
  /^flex(Plus|Max)Budget$/i,
  "flexPlusSubscriptionCost",
  "flexMaxSubscriptionCost",
  "flexPlusDigitalCardIssuanceCost",
  "flexMaxDigitalCardIssuanceCost",
  "flexPlusPhysicalCardIssuanceCost",
  "flexMaxPhysicalCardIssuanceCost",
  "flexPlusCardReissuanceCost",
  "flexMaxCardReissuanceCost",
  "flexPlusSubscriptionCardProcedure",
  "flexMaxSubscriptionCardProcedure",
  "flexPlusSubscriptionCardUnloadingCost",
  "flexMaxSubscriptionCardUnloadingCost",
  "flexPlusCardShippingCost",
  "flexMaxCardShippingCost",
];

/** Go for Eat & Gift PDF: order value, service value, shipping, card issue/reissue. */
const GO_FOR_EAT_AND_GIFT_RULES: WhitelistRule[] = [
  "goForEatBudget",
  "giftBudget",
  "goForEatDigitalBudget",
  "giftDigitalBudget",
  "goForEatCommission",
  "giftCommission",
  "goForEatDigitalCommission",
  "giftDigitalCommission",
  "goForEatCourierFees",
  "giftCourierFees",
  "goForEatDigitalCourierFees",
  "giftDigitalCourierFees",
  "goForEatIssuanceCost",
  "giftIssuanceCost",
  "goForEatCardIssueFees",
  "giftCardIssueFees",
  "goForEatDigitalCardIssueFees",
  "giftDigitalCardIssueFees",
  "goForEatReissuanceCost",
  "giftReissuanceCost",
  "goForEatDigitalReissuanceCost",
  "giftDigitalReissuanceCost",
];

/** Rewards (9) / Gift (11): gift-only pricing lines. */
const GIFT_ONLY_RULES: WhitelistRule[] = [
  "giftBudget",
  "giftDigitalBudget",
  "giftCommission",
  "giftDigitalCommission",
  "giftCourierFees",
  "giftDigitalCourierFees",
  "giftIssuanceCost",
  "giftCardIssueFees",
  "giftDigitalCardIssueFees",
  "giftReissuanceCost",
  "giftDigitalReissuanceCost",
];

/** Up Expense PDF: per-card monthly, pool, ATM, reports, card issue & shipping. */
const EXPENSE_RULES: WhitelistRule[] = [
  "fuelMonthlyCostPerCard",
  "fuelPlusMonthlyCostPerCard",
  "expenseMonthlyCostPerCard",
  "expensePlusMonthlyCostPerCard",
  "expenseAdditionalPoolAccountCost",
  "advancedReportCost",
  "expenseCardIssueFees",
  "expenseCardCourierFees",
];

const FITPASS_RULES: WhitelistRule[] = [
  "fitpassCostValueRange1",
  "fitpassCostValueRange2",
  "fitpassCostValueRange3",
  "fitpassCostValueRange4",
  "fitpassCostValueRange5",
  "fitpassCostValueRange6",
];

const OFFER_PRICING_RULES: Partial<Record<ProductId, WhitelistRule[]>> = {
  [PRODUCT_ID.FLEXONE_SUBSCRIPTION]: FLEXONE_SUBSCRIPTION_RULES,
  [PRODUCT_ID.FLEXONE_COMMISSION]: [],
  [PRODUCT_ID.GO_FOR_EAT_AND_GIFT]: GO_FOR_EAT_AND_GIFT_RULES,
  [PRODUCT_ID.REWARDS]: GIFT_ONLY_RULES,
  [PRODUCT_ID.GIFT]: GIFT_ONLY_RULES,
  [PRODUCT_ID.CHEQUE_DEJEUNER]: [...CHEQUE_DEJEUNER_DISPLAY_KEYS],
  [PRODUCT_ID.EXPENSE]: EXPENSE_RULES,
  [PRODUCT_ID.FITPASS]: FITPASS_RULES,
  [PRODUCT_ID.MERCHANT_MEAL_ACCEPTANCE]: [...MERCHANT_MEAL_DISPLAY_KEYS],
  [PRODUCT_ID.MERCHANT_NON_MEAL_ACCEPTANCE]: [...MERCHANT_NON_MEAL_DISPLAY_KEYS],
  [PRODUCT_ID.MERCHANT_FITPASS_ACCEPTANCE]: [...MERCHANT_FITPASS_DISPLAY_KEYS],
};

const PRODUCT_KEY_MATCHERS: Partial<Record<ProductId, (key: string) => boolean>> = {
  [PRODUCT_ID.FLEXONE_COMMISSION]: isFlexOneCommissionPricingKey,
  [PRODUCT_ID.CHEQUE_DEJEUNER]: isChequeDejeunerPricingKey,
  [PRODUCT_ID.MERCHANT_MEAL_ACCEPTANCE]: isMerchantMealPricingKey,
  [PRODUCT_ID.MERCHANT_NON_MEAL_ACCEPTANCE]: isMerchantNonMealPricingKey,
  [PRODUCT_ID.MERCHANT_FITPASS_ACCEPTANCE]: isMerchantFitpassPricingKey,
};

const ruleIndex = (rules: WhitelistRule[], key: string): number => {
  const index = rules.findIndex((rule) => matchRule(rule, key));
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

const isAllowedPricingKey = (productId: ProductId, key: string): boolean => {
  const customMatcher = PRODUCT_KEY_MATCHERS[productId];
  if (customMatcher?.(key)) {
    return true;
  }

  const rules = OFFER_PRICING_RULES[productId];
  if (!rules) {
    return false;
  }

  return rules.some((rule) => matchRule(rule, key));
};

export const filterPricingForProduct = (
  productId: ProductId,
  pricing: Pricing[],
): Pricing[] => {
  const rules = OFFER_PRICING_RULES[productId] ?? [];

  return pricing
    .filter((row) => Boolean(row.key && isAllowedPricingKey(productId, row.key)))
    .sort((a, b) => ruleIndex(rules, a.key!) - ruleIndex(rules, b.key!));
};
