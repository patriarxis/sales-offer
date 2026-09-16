import type { SalesPerson } from "@/features/offer/model/offer.types";

/** Stable machine-readable reasons for a blocked offer portal load. */
export const OFFER_LOAD_ERROR = {
  MISSING_TOKEN: "MISSING_TOKEN",
  EXPIRED_TOKEN: "EXPIRED_TOKEN",
  INVALID_LINK: "INVALID_LINK",
  UNSUPPORTED_OFFER_TYPE: "UNSUPPORTED_OFFER_TYPE",
  UPSTREAM_UNAVAILABLE: "UPSTREAM_UNAVAILABLE",
} as const;

export type OfferLoadErrorCode =
  (typeof OFFER_LOAD_ERROR)[keyof typeof OFFER_LOAD_ERROR];

const OFFER_LOAD_ERROR_CODES = new Set<string>(Object.values(OFFER_LOAD_ERROR));

export const isOfferLoadErrorCode = (value: string): value is OfferLoadErrorCode =>
  OFFER_LOAD_ERROR_CODES.has(value);

export const showsSalesContact = (code: OfferLoadErrorCode): boolean =>
  code === OFFER_LOAD_ERROR.EXPIRED_TOKEN ||
  code === OFFER_LOAD_ERROR.UNSUPPORTED_OFFER_TYPE;

export const allowsRetry = (code: OfferLoadErrorCode): boolean =>
  code === OFFER_LOAD_ERROR.UPSTREAM_UNAVAILABLE;

/** Dev-only sample sales contact so EXPIRED / UNSUPPORTED previews show the card. */
export const DEV_ERROR_PREVIEW_SALES_PERSON: SalesPerson = {
  firstName: "Ada",
  lastName: "Lovelace",
  title: "Account Manager",
  email: "ada.lovelace@uphellas.gr",
  mobilePhone: "+30 690 000 0000",
  mainPhone: "+30 210 000 0000",
};

/**
 * Parses `?errorPreview=EXPIRED_TOKEN` (dev only). Returns null in production
 * or when the value is missing / unknown.
 */
export const parseDevErrorPreview = (
  value: string | string[] | undefined,
): OfferLoadErrorCode | null => {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return null;
  }

  const normalized = raw.trim().toUpperCase();
  return isOfferLoadErrorCode(normalized) ? normalized : null;
};

export class OfferPageDataError extends Error {
  code: OfferLoadErrorCode;
  salesPerson?: SalesPerson | null;

  constructor(
    code: OfferLoadErrorCode,
    message: string,
    salesPerson?: SalesPerson | null,
  ) {
    super(message);
    this.name = "OfferPageDataError";
    this.code = code;
    this.salesPerson = salesPerson;
  }
}
