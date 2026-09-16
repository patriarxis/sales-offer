import { buildFlexOneCommissionPricing } from "@/features/offer/lib/flexOneCommissionPricing";
import { filterPricingForProduct } from "@/features/offer/lib/offerPricingWhitelist";
import {
  flattenOfferFields,
  formatPricingValue,
  mergePricingByKey,
} from "@/features/offer/lib/pricingBuilderUtils";
import {
  buildChequeDejeunerPricing,
  buildMerchantFitpassPricing,
  buildMerchantMealPricing,
  buildMerchantNonMealPricing,
} from "@/features/offer/lib/productOfferPricing";
import { PRODUCT_ID } from "@/enums/productId";
import { getProductByOfferTypeValue } from "@/lib/productCatalog";
import type { ProductId } from "@/types/domain/product";
import { OFFER_VALIDITY_DAYS } from "@/features/offer/lib/offerExpiration";
import { OFFER_STATUS } from "@/features/offer/model/offerStatus";
import type {
  OfferData,
  OfferDataPayload,
  Pricing,
  Product,
  SalesPerson,
  TranslatedContent,
} from "@/features/offer/model/offer.types";

/** Thrown when offer payload has a missing or unsupported `offerTypeValue`. */
export class OfferMappingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OfferMappingError";
  }
}

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};

const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const asNumber = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

/** CRM label is "Order Value Type (GR)"; API key is usually without the Gr suffix. */
const resolveFlexOneCommissionOrderValueType = (
  ...sources: Record<string, unknown>[]
): string => {
  for (const source of sources) {
    const value = asString(
      source.flexOneCommissionOrderValueType,
      asString(
        source.flexOneCommissionOrderValueTypeGr,
        asString(source.flexOneCommissionOrderValueTypeGR, ""),
      ),
    );
    if (value) {
      return value;
    }
  }
  return "";
};

const formatCurrency = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value.toLocaleString("el-GR")} €`;
  }
  return "-";
};

const toDisplayLabel = (key: string): string =>
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());

const EMPTY_FINANCIALS: OfferData["financials"] = {
  monthlyTotal: "-",
  yearlyTotal: "-",
  estimatedSavings: "-",
};

const parseOfferDate = (value: string): Date | null => {
  if (!value) return null;
  const trimmed = value.trim();

  const dmy = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const iso = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T00:00:00`;
    const parsed = new Date(iso);
    if (Number.isFinite(parsed.valueOf())) {
      return parsed;
    }
  }

  const direct = Date.parse(trimmed);
  if (Number.isFinite(direct)) {
    return new Date(direct);
  }

  return null;
};

const computeExpiresAtFromOfferDate = (offerDate: string): string => {
  const parsed = parseOfferDate(offerDate);
  if (!parsed) return "";

  const expiresAt = new Date(parsed);
  expiresAt.setDate(expiresAt.getDate() + OFFER_VALIDITY_DAYS);
  return expiresAt.toISOString();
};

const normalizeStatus = (status: string): OFFER_STATUS => {
  const lower = status.trim().toLowerCase();

  if (lower === "won" || lower.includes("accept")) {
    return OFFER_STATUS.ACCEPTED;
  }
  if (lower === "lost" || lower.includes("reject")) {
    return OFFER_STATUS.REJECTED;
  }
  return OFFER_STATUS.PENDING;
};

const mapLocalized = (
  root: Record<string, unknown>,
): Record<"el" | "en", TranslatedContent> => {
  const localized = asRecord(root.localized);
  const el = asRecord(localized.el);
  const en = asRecord(localized.en);

  const fallback: TranslatedContent = {
    address: asString(root.address, "-"),
    comments: asString(
      root.offerComment,
      asString(root.comments, "-"),
    ),
    paymentTerms: asString(root.paymentTerms, "-"),
    paymentMethod: asString(root.paymentMethod, "-"),
    contractDuration: asString(root.contractDuration, "-"),
    contractRenewal: asString(root.contractRenewal, "-"),
    contractNotice: asString(root.contractNotice, "-"),
  };

  return {
    el: {
      address: asString(el.address, fallback.address),
      comments: asString(
        el.offerComment,
        asString(el.comments, fallback.comments),
      ),
      paymentTerms: asString(el.paymentTerms, fallback.paymentTerms),
      paymentMethod: asString(el.paymentMethod, fallback.paymentMethod),
      contractDuration: asString(el.contractDuration, fallback.contractDuration),
      contractRenewal: asString(el.contractRenewal, fallback.contractRenewal),
      contractNotice: asString(el.contractNotice, fallback.contractNotice),
    },
    en: {
      address: asString(en.address, fallback.address),
      comments: asString(
        en.offerComment,
        asString(en.comments, fallback.comments),
      ),
      paymentTerms: asString(en.paymentTerms, fallback.paymentTerms),
      paymentMethod: asString(en.paymentMethod, fallback.paymentMethod),
      contractDuration: asString(en.contractDuration, fallback.contractDuration),
      contractRenewal: asString(en.contractRenewal, fallback.contractRenewal),
      contractNotice: asString(en.contractNotice, fallback.contractNotice),
    },
  };
};

const mapPricing = (value: unknown): Pricing[] =>
  asArray(value).map((item, idx) => {
    const row = asRecord(item);
    const key = asString(row.key) || undefined;
    const raw = row.monthly ?? row.amount ?? row.value ?? row.cost ?? row.price;
    return {
      key,
      category: asString(row.category, `Line ${idx + 1}`),
      monthly: formatPricingValue(key ?? "", raw),
    };
  });

const mapProductRecord = (row: Record<string, unknown>, idx: number): Product => {
  const knownPricing: Array<[string, string]> = [
    ["flexPlusOrderValue", "Flex Plus Order Value"],
    ["flexMaxOrderValue", "Flex Max Order Value"],
    ["flexPlusSubscriptionCost", "Flex Plus Subscription"],
    ["flexMaxSubscriptionCost", "Flex Max Subscription"],
    ["flexPlusServiceCommission", "Flex Plus Service Commission"],
    ["flexMaxServiceCommission", "Flex Max Service Commission"],
    ["flexPlusDigitalCardIssuanceCost", "Flex Plus Digital Card Issuance"],
    ["flexMaxDigitalCardIssuanceCost", "Flex Max Digital Card Issuance"],
    ["flexPlusPhysicalCardIssuanceCost", "Flex Plus Physical Card Issuance"],
    ["flexMaxPhysicalCardIssuanceCost", "Flex Max Physical Card Issuance"],
    ["flexPlusCardReissuanceCost", "Flex Plus Card Reissuance"],
    ["flexMaxCardReissuanceCost", "Flex Max Card Reissuance"],
    ["flexPlusSubscriptionCardProcedure", "Flex Plus Virtual & Physical Card Process"],
    ["flexMaxSubscriptionCardProcedure", "Flex Max Virtual & Physical Card Process"],
    ["flexPlusSubscriptionCardUnloadingCost", "Flex Plus Virtual & Physical Card Process"],
    ["flexMaxSubscriptionCardUnloadingCost", "Flex Max Virtual & Physical Card Process"],
    ["flexPlusCardShippingCost", "Flex Plus Card Shipping"],
    ["flexMaxCardShippingCost", "Flex Max Card Shipping"],
    ["flexOneCommissionOrderValue", "Order Value"],
    ["flexOneCommissionServiceCost", "Service Commission"],
    ["flexOneCommissionDigitalCardIssuanceCost", "Digital Card Issuance"],
    ["flexOneCommissionPhysicalCardIssuanceCost", "Physical Card Issuance"],
    ["flexOneCommissionCardProcedureCost", "Virtual & Physical Card Process"],
    ["flexOneCommissionCardReissuanceCost", "Card Replacement"],
    ["flexOneCommissionCardShippingCost", "Card Shipping"],
    ["goForEatBudget", "Go For Eat Budget"],
    ["goForEatCommission", "Go For Eat Commission"],
    ["goForEatCourierFees", "Go For Eat Courier Fees"],
    ["goForEatIssuanceCost", "Go For Eat Issuance Cost"],
    ["goForEatReissuanceCost", "Go For Eat Reissuance Cost"],
    ["goForEatCardIssueFees", "Go For Eat Card Issue Fees"],
    ["giftBudget", "Gift Budget"],
    ["giftCommission", "Gift Commission"],
    ["giftCourierFees", "Gift Courier Fees"],
    ["giftIssuanceCost", "Gift Issuance Cost"],
    ["giftReissuanceCost", "Gift Reissuance Cost"],
    ["giftCardIssueFees", "Gift Card Issue Fees"],
    ["goForEatDigitalBudget", "Go For Eat Digital Budget"],
    ["goForEatDigitalCommission", "Go For Eat Digital Commission"],
    ["goForEatDigitalCourierFees", "Go For Eat Digital Courier Fees"],
    ["goForEatDigitalCardIssueFees", "Go For Eat Digital Card Issue Fees"],
    ["goForEatDigitalReissuanceCost", "Go For Eat Digital Reissuance Cost"],
    ["giftDigitalBudget", "Gift Digital Budget"],
    ["giftDigitalCommission", "Gift Digital Commission"],
    ["giftDigitalCourierFees", "Gift Digital Courier Fees"],
    ["giftDigitalCardIssueFees", "Gift Digital Card Issue Fees"],
    ["giftDigitalReissuanceCost", "Gift Digital Reissuance Cost"],
    ["goForEatSubscriptionCost", "Go For Eat Service Value"],
    ["giftSubscriptionCost", "Gift Service Value"],
    ["goForEatDigitalSubscriptionCost", "Go For Eat Digital Service Value"],
    ["giftDigitalSubscriptionCost", "Gift Digital Service Value"],
    ["chequeDejeunerBudget", "Order Value"],
    ["chequeDejeunerCommission", "Service Value"],
    ["chequeDejeunerCourierFees", "Shipping Cost"],
    ["chequeDejeunerCostOfLateReturn", "Late Return Cost"],
    ["fuelMonthlyCostPerCard", "Fuel Monthly Cost per Card"],
    ["fuelPlusMonthlyCostPerCard", "Fuel Plus Monthly Cost per Card"],
    ["expenseMonthlyCostPerCard", "Expense Monthly Cost per Card"],
    ["expensePlusMonthlyCostPerCard", "Expense Plus Monthly Cost per Card"],
    ["expenseAdditionalPoolAccountCost", "Additional Pool Account Cost"],
    ["advancedReportCost", "Advanced Report Cost"],
    ["expenseCardIssueFees", "Expense Card Issuance"],
    ["expenseCardCourierFees", "Expense Card Shipping"],
    ["fitpassCostValueRange1", "Fitpass Cost 0–15"],
    ["fitpassCostValueRange2", "Fitpass Cost 16–30"],
    ["fitpassCostValueRange3", "Fitpass Cost 31–100"],
    ["fitpassCostValueRange4", "Fitpass Cost 101–250"],
    ["fitpassCostValueRange5", "Fitpass Cost 251–1000"],
    ["fitpassCostValueRange6", "Fitpass Cost 1001+"],
    ["goForEatYearlySubscription", "Go For Eat Yearly Subscription"],
    ["goForEatMerchantCommission", "Merchant Go For Eat Commission"],
    ["goForEatMerchantYearlySubscription", "Merchant Go For Eat Yearly Subscription"],
    ["merchantGiftCommission", "Merchant Gift Commission"],
    ["merchantGiftYearlySubscription", "Merchant Gift Yearly Subscription"],
    ["cashback", "Cashback Campaign"],
    ["upGiftCommission", "Up Gift Commission"],
    ["upGiftYearlySubscription", "Up Gift Yearly Subscription"],
    ["fitpassMerchantServiceValue", "Merchant Fitpass Service Value"],
    ["fitpassMerchantServiceValueWithVatCost", "Merchant Fitpass Service Value with VAT"],
    ["merchantFitpassServiceValue", "Merchant Fitpass Service Value"],
    ["merchantFitpassServiceValueWithVatCost", "Merchant Fitpass Service Value with VAT"],
    ["cardIssueCost", "Card Issuance Cost"],
    ["cardShippingCost", "Card Shipping Cost"],
  ];

  const mappedPricing = knownPricing
    .map<Pricing | null>(([key, label]) => {
      const value = row[key];
      if (value === null || value === undefined || value === "") {
        return null;
      }
      return {
        key,
        category: label,
        monthly: formatPricingValue(key, value),
      };
    })
    .filter((item) => item !== null);

  const fallbackPricing = Object.entries(row)
    .filter(
      ([key, value]) =>
        /^([a-z].*Cost|.*Budget|.*Commission|.*Fees|.*Subscription|.*Issuance|.*Reissuance)$/i.test(
          key,
        ) &&
        value !== null &&
        value !== undefined &&
        value !== "",
    )
    .map(([key, value]) => ({
      key,
      category: toDisplayLabel(key),
      monthly: formatPricingValue(key, value),
    }));

  const pricing = mergePricingByKey(
    mappedPricing.length > 0 ? mappedPricing : fallbackPricing,
    mapPricing(row.pricing),
  );

  return {
    id: asString(row.id, `product-${idx + 1}`),
    plan: asString(row.plan, asString(row.productName, asString(row.name, "Product"))),
    pricingModel: asString(
      row.pricingModel,
      asString(
        row.goForEatAndGiftOrderValueType,
        resolveFlexOneCommissionOrderValueType(row),
      ),
    ),
    employeeCount: asNumber(row.employeeCount),
    taxBenefitPerEmployee: asNumber(row.taxBenefitPerEmployee),
    cardType: asString(row.cardType, "-"),
    pricing,
  };
};

const emptyProduct = (): Product => ({
  id: "offer",
  plan: "Offer",
  employeeCount: 0,
  taxBenefitPerEmployee: 0,
  cardType: "-",
  pricing: [],
});

type ProductPricingBuilder = (row: Record<string, unknown>) => Pricing[];

const buildPricingFromOfferRow = (
  build: ProductPricingBuilder,
  root: Record<string, unknown>,
  row: Record<string, unknown> = {},
): Pricing[] => build(flattenOfferFields({ ...root, ...row }));

const PRODUCT_PRICING_BUILDERS: Partial<
  Record<ProductId, { id: string; plan: string; build: ProductPricingBuilder }>
> = {
  [PRODUCT_ID.FLEXONE_COMMISSION]: {
    id: "flexone-commission",
    plan: "FlexOne Commission",
    build: buildFlexOneCommissionPricing,
  },
  [PRODUCT_ID.CHEQUE_DEJEUNER]: {
    id: "cheque-dejeuner",
    plan: "Chèque Déjeuner",
    build: buildChequeDejeunerPricing,
  },
  [PRODUCT_ID.MERCHANT_MEAL_ACCEPTANCE]: {
    id: "merchant-meal",
    plan: "Merchant Meal Acceptance",
    build: buildMerchantMealPricing,
  },
  [PRODUCT_ID.MERCHANT_NON_MEAL_ACCEPTANCE]: {
    id: "merchant-non-meal",
    plan: "Merchant Non-Meal Acceptance",
    build: buildMerchantNonMealPricing,
  },
  [PRODUCT_ID.MERCHANT_FITPASS_ACCEPTANCE]: {
    id: "merchant-fitpass",
    plan: "Merchant Fitpass Acceptance",
    build: buildMerchantFitpassPricing,
  },
};

const enrichProductsForOfferType = (
  productId: ProductId,
  root: Record<string, unknown>,
  products: Product[],
  productRows: Record<string, unknown>[],
): Product[] => {
  const config = PRODUCT_PRICING_BUILDERS[productId];

  if (!config) {
    return products.map((product) => ({
      ...product,
      pricing: filterPricingForProduct(productId, product.pricing),
    }));
  }

  if (products.length === 0) {
    return [
      {
        ...emptyProduct(),
        id: config.id,
        plan: config.plan,
        pricingModel:
          productId === PRODUCT_ID.FLEXONE_COMMISSION
            ? resolveFlexOneCommissionOrderValueType(root)
            : undefined,
        pricing: filterPricingForProduct(
          productId,
          mergePricingByKey(
            buildPricingFromOfferRow(config.build, root),
            mapPricing(root.pricing),
          ),
        ),
      },
    ];
  }

  return products.map((product, idx) => {
    const row = productRows[idx] ?? {};
    const merged = mergePricingByKey(
      product.pricing,
      buildPricingFromOfferRow(config.build, root, row),
      mapPricing(root.pricing),
      mapPricing(row.pricing),
    );

    return {
      ...product,
      pricingModel:
        product.pricingModel ||
        (productId === PRODUCT_ID.FLEXONE_COMMISSION
          ? resolveFlexOneCommissionOrderValueType(row, root)
          : product.pricingModel),
      pricing: filterPricingForProduct(productId, merged),
    };
  });
};

export const parseSalesPerson = (value: unknown): SalesPerson | null => {
  const record = asRecord(value);
  const firstName = asString(record.firstName);
  const lastName = asString(record.lastName);
  const title = asString(record.title);
  const email = asString(record.email);
  const mobilePhone = asString(record.mobilePhone);
  const mainPhone = asString(record.mainPhone);

  if (!firstName && !lastName && !email && !mobilePhone && !mainPhone) {
    return null;
  }

  return { firstName, lastName, title, email, mobilePhone, mainPhone };
};

const mapProducts = (root: Record<string, unknown>): Product[] => {
  const source = asArray(root.products);
  const singleProduct = asRecord(root.Product);
  const normalizedSource =
    source.length > 0 ? source : Object.keys(singleProduct).length > 0 ? [singleProduct] : [];

  return normalizedSource.map((item, idx) => {
    const row = asRecord(item);
    return mapProductRecord(row, idx);
  });
};

export const mapOfferPayload = (
  payload: OfferDataPayload,
  fallbackOfferId: string,
): OfferData => {
  const root = asRecord(payload.data ?? payload.offer ?? payload);
  const company = asRecord(root.company);
  const details = asRecord(root.offerDetails ?? root.offer);
  const sourceProducts = asArray(root.products);
  const singleProduct = asRecord(root.Product);
  const normalizedProducts =
    sourceProducts.length > 0
      ? sourceProducts
      : Object.keys(singleProduct).length > 0
        ? [singleProduct]
        : [];
  const productRows = normalizedProducts.map((item) => asRecord(item));
  const apiStatus = asString(root.offerStatus, asString(details.status, "pending"));

  const offerTypeValue = root.offerTypeValue;
  const detectedProduct = getProductByOfferTypeValue(
    typeof offerTypeValue === "number" || typeof offerTypeValue === "string"
      ? offerTypeValue
      : null,
  );

  if (!detectedProduct) {
    throw new OfferMappingError(
      `Missing or unsupported offerTypeValue: ${String(offerTypeValue ?? "undefined")}`,
    );
  }

  const payloadPdfUrl = asString(details.pdfUrl ?? root.pdfUrl ?? root.offerPdfUrl);
  const pdfUrl = payloadPdfUrl
    ? { el: payloadPdfUrl, en: payloadPdfUrl }
    : detectedProduct.pdfUrl;

  return {
    companyName: asString(root.companyName, asString(company.name, "Unknown Company")),
    taxNumber: asString(root.taxNumber, asString(company.taxNumber, "-")),
    productId: detectedProduct.id,
    salesPerson:
      parseSalesPerson(root.salesPerson ?? root.SalesPerson) ??
      parseSalesPerson(payload.salesPerson ?? payload.SalesPerson),
    localized: mapLocalized(root),
    offerDetails: {
      name: asString(root.offerName, asString(details.name)),
      refNumber: asString(
        root.offerReferenceNumber,
        asString(details.refNumber, fallbackOfferId),
      ),
      date: asString(root.offerDate, asString(details.date, "-")),
      expiresAt: computeExpiresAtFromOfferDate(
        asString(root.offerDate, asString(details.date)),
      ),
      status: normalizeStatus(apiStatus),
      offerTypeValue: String(offerTypeValue ?? ""),
      acceptUrl: asString(
        root.acceptURL ??
          root.acceptUrl ??
          root.AcceptURL ??
          details.acceptURL ??
          details.acceptUrl,
      ),
      rejectUrl: asString(
        root.rejectURL ??
          root.rejectUrl ??
          root.RejectURL ??
          details.rejectURL ??
          details.rejectUrl,
      ),
      pdfUrl,
    },
    financials: EMPTY_FINANCIALS,
    products: enrichProductsForOfferType(
      detectedProduct.id,
      root,
      mapProducts(root),
      productRows,
    ),
  };
};
