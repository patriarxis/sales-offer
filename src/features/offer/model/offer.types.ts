import type { ProductId } from "@/types/domain/product";
import { OFFER_STATUS } from "./offerStatus";

export type Locale = "el" | "en";

export type OfferStatus = OFFER_STATUS;

export interface TranslatedContent {
  address: string;
  comments: string;
  paymentTerms: string;
  paymentMethod: string;
  contractDuration: string;
  contractRenewal: string;
  contractNotice: string;
}

export interface Pricing {
  key?: string;
  category: string;
  monthly: string;
}

export interface Product {
  id: string;
  plan: string;
  pricingModel?: string;
  employeeCount: number;
  taxBenefitPerEmployee: number;
  cardType: string;
  pricing: Pricing[];
}

export interface SalesPerson {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  mobilePhone: string;
  mainPhone: string;
}

export interface OfferData {
  companyName: string;
  taxNumber: string;
  productId: ProductId;
  salesPerson?: SalesPerson | null;
  localized: Record<Locale, TranslatedContent>;
  offerDetails: {
    name?: string;
    refNumber: string;
    date: string;
    expiresAt: string;
    status: OfferStatus;
    offerTypeValue?: string;
    acceptUrl?: string;
    rejectUrl?: string;
    pdfUrl?: Partial<Record<Locale, string>>;
  };
  financials: {
    monthlyTotal: string;
    yearlyTotal: string;
    estimatedSavings: string;
  };
  products: Product[];
}

export interface TranslationSchema {
  [key: string]: any;
}

/** CRM-shaped offer payload (historically from Azure GetOfferData; now local fixtures). */
export interface OfferDataPayload extends Record<string, unknown> {
  data?: Record<string, unknown>;
  offer?: Record<string, unknown>;
  companyName?: string;
  taxNumber?: string;
  products?: unknown[];
}

/** @deprecated Use OfferDataPayload */
export type AzureOfferDataPayload = OfferDataPayload;
