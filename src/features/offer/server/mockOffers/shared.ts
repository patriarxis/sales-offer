import type { OfferDataPayload } from "@/features/offer/model/offer.types";

/** Fictional company used across all portfolio demo offers. */
export const DEMO_COMPANY = {
  companyName: "Aegean Crafts S.A.",
  taxNumber: "999999999",
} as const;

/** Fictional account manager — not a real Up Hellas employee. */
export const DEMO_SALES_PERSON = {
  firstName: "Alex",
  lastName: "Demou",
  title: "Account Manager",
  email: "alex.demou@example.com",
  mobilePhone: "+30 690 000 0000",
  mainPhone: "+30 210 000 0000",
} as const;

export const DEMO_LOCALIZED = {
  el: {
    address: "Λεωφ. Συγγρού 100, Αθήνα 117 45",
    comments: "Ενδεικτική προσφορά για παρουσίαση χαρτοφυλακίου — πλασματικά δεδομένα.",
    paymentTerms: "30 ημέρες",
    paymentMethod: "Τραπεζική μεταφορά",
    contractDuration: "12 μήνες",
    contractRenewal: "Αυτόματη ανανέωση",
    contractNotice: "30 ημέρες ειδοποίηση",
  },
  en: {
    address: "100 Syngrou Ave, Athens 117 45",
    comments: "Sample offer for portfolio demo — fictional data.",
    paymentTerms: "30 days",
    paymentMethod: "Bank transfer",
    contractDuration: "12 months",
    contractRenewal: "Auto-renewal",
    contractNotice: "30 days notice",
  },
} as const;

/** Format today's date as DD/MM/YYYY so the offer stays within the validity window. */
export const formatDemoOfferDate = (date = new Date()): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export type DemoOfferDefinition = {
  token: string;
  offerTypeValue: number;
  offerName: string;
  refSuffix: string;
  productFields: Record<string, unknown>;
};

export const buildDemoPayload = (
  def: DemoOfferDefinition,
): OfferDataPayload => ({
  ...DEMO_COMPANY,
  offerTypeValue: def.offerTypeValue,
  offerName: def.offerName,
  offerReferenceNumber: `DEMO-${def.refSuffix}`,
  offerDate: formatDemoOfferDate(),
  offerStatus: "pending",
  acceptURL: "demo://accept",
  rejectURL: "demo://reject",
  salesPerson: { ...DEMO_SALES_PERSON },
  localized: {
    el: { ...DEMO_LOCALIZED.el },
    en: { ...DEMO_LOCALIZED.en },
  },
  Product: {
    id: `demo-${def.token}`,
    plan: def.offerName,
    employeeCount: 120,
    ...def.productFields,
  },
});
