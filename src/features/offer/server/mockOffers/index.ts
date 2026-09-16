import { PRODUCT_ID } from "@/enums/productId";
import type { OfferDataPayload } from "@/features/offer/model/offer.types";
import { getProductById } from "@/lib/productCatalog";
import type { ProductId } from "@/types/domain/product";
import {
  buildDemoPayload,
  type DemoOfferDefinition,
} from "./shared";

/**
 * Demo tokens → CRM-shaped fixtures. Keys follow the offer mapper / pricing
 * whitelist so PDF AcroForm fill still works without Azure.
 */
const DEMO_DEFINITIONS: DemoOfferDefinition[] = [
  {
    token: "demo-flexone-subscription",
    offerTypeValue: 7,
    offerName: "FlexOne Subscription",
    refSuffix: "FOS-001",
    productFields: {
      flexPlusOrderValue: { value: 100, amount: 100 },
      flexMaxOrderValue: { value: 200, amount: 200 },
      flexPlusSubscriptionCost: { value: 4.9, amount: 4.9 },
      flexMaxSubscriptionCost: { value: 7.9, amount: 7.9 },
      flexPlusDigitalCardIssuanceCost: { value: 0, amount: 0 },
      flexMaxDigitalCardIssuanceCost: { value: 0, amount: 0 },
      flexPlusPhysicalCardIssuanceCost: { value: 3, amount: 3 },
      flexMaxPhysicalCardIssuanceCost: { value: 3, amount: 3 },
      flexPlusCardReissuanceCost: { value: 5, amount: 5 },
      flexMaxCardReissuanceCost: { value: 5, amount: 5 },
      flexPlusCardShippingCost: { value: 2, amount: 2 },
      flexMaxCardShippingCost: { value: 2, amount: 2 },
    },
  },
  {
    token: "demo-flexone-commission",
    offerTypeValue: 8,
    offerName: "FlexOne Commission",
    refSuffix: "FOC-001",
    productFields: {
      flexOneCommissionOrderValueType: "Order Value",
      flexOneCommissionOrderValue: { value: 150, amount: 150 },
      flexOneCommissionServiceCost: { value: 3.2, amount: 3.2 },
      flexOneCommissionDigitalCardIssuanceCost: { value: 0, amount: 0 },
      flexOneCommissionPhysicalCardIssuanceCost: { value: 3, amount: 3 },
      flexOneCommissionCardProcedureCost: { value: 1, amount: 1 },
      flexOneCommissionCardReissuanceCost: { value: 5, amount: 5 },
      flexOneCommissionCardShippingCost: { value: 2, amount: 2 },
    },
  },
  {
    token: "demo-expense",
    offerTypeValue: 0,
    offerName: "Up Expense",
    refSuffix: "EXP-001",
    productFields: {
      fuelMonthlyCostPerCard: { value: 8, amount: 8 },
      fuelPlusMonthlyCostPerCard: { value: 12, amount: 12 },
      expenseMonthlyCostPerCard: { value: 6, amount: 6 },
      expensePlusMonthlyCostPerCard: { value: 10, amount: 10 },
      expenseAdditionalPoolAccountCost: { value: 25, amount: 25 },
      advancedReportCost: { value: 15, amount: 15 },
      expenseCardIssueFees: { value: 5, amount: 5 },
      expenseCardCourierFees: { value: 3, amount: 3 },
    },
  },
  {
    token: "demo-go-for-eat",
    offerTypeValue: 2,
    offerName: "Go For Eat & Gift",
    refSuffix: "GFE-001",
    productFields: {
      goForEatBudget: { value: 150, amount: 150 },
      giftBudget: { value: 80, amount: 80 },
      goForEatDigitalBudget: { value: 120, amount: 120 },
      giftDigitalBudget: { value: 60, amount: 60 },
      goForEatCommission: { value: 3.5, amount: 3.5 },
      giftCommission: { value: 4, amount: 4 },
      goForEatDigitalCommission: { value: 2.5, amount: 2.5 },
      giftDigitalCommission: { value: 3, amount: 3 },
      goForEatCourierFees: { value: 5, amount: 5 },
      giftCourierFees: { value: 5, amount: 5 },
      goForEatIssuanceCost: { value: 2, amount: 2 },
      giftIssuanceCost: { value: 2, amount: 2 },
      goForEatCardIssueFees: { value: 2, amount: 2 },
      giftCardIssueFees: { value: 2, amount: 2 },
      goForEatReissuanceCost: { value: 4, amount: 4 },
      giftReissuanceCost: { value: 4, amount: 4 },
    },
  },
  {
    token: "demo-gift",
    offerTypeValue: 11,
    offerName: "Up Gift",
    refSuffix: "GFT-001",
    productFields: {
      giftBudget: { value: 120, amount: 120 },
      giftDigitalBudget: { value: 90, amount: 90 },
      giftCommission: { value: 4.5, amount: 4.5 },
      giftDigitalCommission: { value: 3.5, amount: 3.5 },
      giftCourierFees: { value: 5, amount: 5 },
      giftIssuanceCost: { value: 2, amount: 2 },
      giftCardIssueFees: { value: 2, amount: 2 },
      giftReissuanceCost: { value: 4, amount: 4 },
    },
  },
  {
    token: "demo-rewards",
    offerTypeValue: 9,
    offerName: "Rewards",
    refSuffix: "RW-001",
    productFields: {
      giftBudget: { value: 100, amount: 100 },
      giftDigitalBudget: { value: 80, amount: 80 },
      giftCommission: { value: 4, amount: 4 },
      giftDigitalCommission: { value: 3, amount: 3 },
      giftCourierFees: { value: 5, amount: 5 },
      giftIssuanceCost: { value: 2, amount: 2 },
      giftCardIssueFees: { value: 2, amount: 2 },
      giftReissuanceCost: { value: 4, amount: 4 },
    },
  },
  {
    token: "demo-fitpass",
    offerTypeValue: 1,
    offerName: "Fitpass",
    refSuffix: "FIT-001",
    productFields: {
      fitpassCostValueRange1: { value: 18, amount: 18 },
      fitpassCostValueRange2: { value: 22, amount: 22 },
      fitpassCostValueRange3: { value: 28, amount: 28 },
      fitpassCostValueRange4: { value: 35, amount: 35 },
      fitpassCostValueRange5: { value: 42, amount: 42 },
      fitpassCostValueRange6: { value: 50, amount: 50 },
    },
  },
  {
    token: "demo-cheque-dejeuner",
    offerTypeValue: 3,
    offerName: "Chèque Déjeuner",
    refSuffix: "CD-001",
    productFields: {
      chequeDejeunerBudget: { value: 200, amount: 200 },
      chequeDejeunerCommission: { value: 4.5, amount: 4.5 },
      chequeDejeunerCourierFees: { value: 8, amount: 8 },
      chequeDejeunerCostOfLateReturn: { value: 2, amount: 2 },
    },
  },
  {
    token: "demo-merchant-meal",
    offerTypeValue: 4,
    offerName: "Merchant Meal Acceptance",
    refSuffix: "MM-001",
    productFields: {
      goForEatMerchantCommission: { value: 5, amount: 5 },
      goForEatMerchantYearlySubscription: { value: 120, amount: 120 },
      cashback: { value: 1.5, amount: 1.5 },
    },
  },
  {
    token: "demo-merchant-non-meal",
    offerTypeValue: 5,
    offerName: "Merchant Non-Meal Acceptance",
    refSuffix: "MNM-001",
    productFields: {
      merchantGiftCommission: { value: 4, amount: 4 },
      merchantGiftYearlySubscription: { value: 100, amount: 100 },
      cashback: { value: 1, amount: 1 },
    },
  },
  {
    token: "demo-merchant-fitpass",
    offerTypeValue: 6,
    offerName: "Merchant Fitpass Acceptance",
    refSuffix: "MF-001",
    productFields: {
      fitpassMerchantServiceValue: { value: 3.5, amount: 3.5 },
      fitpassMerchantServiceValueWithVatCost: { value: 4.34, amount: 4.34 },
    },
  },
];

const TOKEN_TO_PRODUCT_ID: Record<string, ProductId> = {
  "demo-expense": PRODUCT_ID.EXPENSE,
  "demo-fitpass": PRODUCT_ID.FITPASS,
  "demo-go-for-eat": PRODUCT_ID.GO_FOR_EAT_AND_GIFT,
  "demo-cheque-dejeuner": PRODUCT_ID.CHEQUE_DEJEUNER,
  "demo-merchant-meal": PRODUCT_ID.MERCHANT_MEAL_ACCEPTANCE,
  "demo-merchant-non-meal": PRODUCT_ID.MERCHANT_NON_MEAL_ACCEPTANCE,
  "demo-merchant-fitpass": PRODUCT_ID.MERCHANT_FITPASS_ACCEPTANCE,
  "demo-flexone-subscription": PRODUCT_ID.FLEXONE_SUBSCRIPTION,
  "demo-flexone-commission": PRODUCT_ID.FLEXONE_COMMISSION,
  "demo-rewards": PRODUCT_ID.REWARDS,
  "demo-gift": PRODUCT_ID.GIFT,
};

export const DEMO_OFFER_TOKENS = DEMO_DEFINITIONS.map((d) => d.token);

export type DemoGalleryItem = {
  token: string;
  productId: ProductId;
  displayName: string;
};

export const getDemoGalleryItems = (): DemoGalleryItem[] =>
  DEMO_DEFINITIONS.map((def) => {
    const productId = TOKEN_TO_PRODUCT_ID[def.token];
    const product = getProductById(productId);

    return {
      token: def.token,
      productId,
      displayName: product?.displayName ?? def.offerName,
    };
  });

export const isDemoOfferToken = (token: string): boolean =>
  Object.prototype.hasOwnProperty.call(TOKEN_TO_PRODUCT_ID, token);

export const getMockOfferPayload = (
  token: string,
): OfferDataPayload | null => {
  const def = DEMO_DEFINITIONS.find((d) => d.token === token);
  if (!def) return null;
  return buildDemoPayload(def);
};

export const getDemoTokenForProductId = (
  productId: ProductId,
): string | null => {
  const entry = Object.entries(TOKEN_TO_PRODUCT_ID).find(
    ([, id]) => id === productId,
  );
  return entry ? entry[0] : null;
};
