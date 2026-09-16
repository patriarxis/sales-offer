import type { StaticImageData } from "next/image";
import { PRODUCT_ID } from "@/enums/productId";
import type { ILocale } from "@/types/i18n";

export type ProductId = PRODUCT_ID;

export interface ProductLogo {
  src: StaticImageData;
  alt: string;
}

export type LocalizedPdfUrls = Partial<Record<ILocale, string>>;

export interface ProductDefinition {
  id: ProductId;
  displayName: string;
  logo: ProductLogo;
  pdfUrl: LocalizedPdfUrls;
}
