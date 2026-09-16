import {
  OFFER_LOAD_ERROR,
  OfferPageDataError,
} from "@/features/offer/model/offerLoadError";
import { getMockOfferPayload, isDemoOfferToken } from "./mockOffers";
import { mapOfferPayload, OfferMappingError, parseSalesPerson } from "./offerMapper";

export { OfferPageDataError } from "@/features/offer/model/offerLoadError";
export type { OfferLoadErrorCode } from "@/features/offer/model/offerLoadError";

/**
 * Portfolio demo: resolve offer data from local fixtures keyed by demo token.
 * No Azure / CRM calls.
 */
export const getOfferPageData = async (token: string) => {
  if (!isDemoOfferToken(token)) {
    throw new OfferPageDataError(
      OFFER_LOAD_ERROR.INVALID_LINK,
      `Unknown demo token: ${token}`,
    );
  }

  const payload = getMockOfferPayload(token);
  if (!payload) {
    throw new OfferPageDataError(
      OFFER_LOAD_ERROR.INVALID_LINK,
      `No fixture for token: ${token}`,
    );
  }

  try {
    const offerData = mapOfferPayload(payload, token);
    return { offerData };
  } catch (error) {
    if (error instanceof OfferMappingError) {
      throw new OfferPageDataError(
        OFFER_LOAD_ERROR.UNSUPPORTED_OFFER_TYPE,
        error.message,
        parseSalesPerson(payload.salesPerson ?? payload.SalesPerson),
      );
    }
    throw error;
  }
};
