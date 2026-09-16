import type { OfferData } from "@/features/offer/model/offer.types";
import { getProductById } from "@/lib/productCatalog";
import type { ProductLogo } from "@/types/domain/product";

export const getConnectionGraphicProductLogo = (
  offerData: OfferData,
): ProductLogo => {
  const product = getProductById(offerData.productId);
  if (!product) {
    throw new Error(`Unknown productId for offer display: ${offerData.productId}`);
  }

  return product.logo;
};
