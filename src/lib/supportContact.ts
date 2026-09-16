import { isNetworkProduct } from "@/lib/productCatalog";
import type { ProductId } from "@/types/domain/product";

export const DEFAULT_SUPPORT_EMAIL = "sales@uphellas.gr";
export const PARTNER_SUPPORT_EMAIL = "partner@uphellas.gr";
export const SUPPORT_PHONE_DISPLAY = "210 324 6909";
export const SUPPORT_PHONE_TEL = "+302103246909";

export const getSupportEmail = (productId?: ProductId | null): string =>
  isNetworkProduct(productId) ? PARTNER_SUPPORT_EMAIL : DEFAULT_SUPPORT_EMAIL;
