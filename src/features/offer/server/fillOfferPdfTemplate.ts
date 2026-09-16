import { promises as fs } from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument } from "pdf-lib";

const ASSETS_ROOT = path.join(process.cwd(), "src", "assets");
const UNICODE_FONT_PATH = path.join(ASSETS_ROOT, "fonts", "Aptos.ttf");

export const isAllowedTemplatePath = (relativePath: string): boolean =>
  /^offers\/[^/]+\.pdf$/i.test(relativePath);

/**
 * Resolves a validated `offers/<name>.pdf` relative path to an absolute file
 * path inside the assets root, matching by Unicode-normalized filename when a
 * direct lookup fails (Greek filenames can differ in NFC/NFD form on disk).
 */
export const resolveOfferTemplatePath = async (
  relativePath: string,
): Promise<string> => {
  if (!isAllowedTemplatePath(relativePath)) {
    throw new Error("Invalid offer PDF template path.");
  }

  const requestedName = path.basename(relativePath);
  const offersDir = path.join(ASSETS_ROOT, "offers");
  const directPath = path.join(ASSETS_ROOT, relativePath);

  let resolved = directPath;
  try {
    await fs.access(directPath);
  } catch {
    const entries = await fs.readdir(offersDir);
    const normalizedRequested = requestedName.normalize("NFC");
    const match = entries.find(
      (entry) => entry.normalize("NFC") === normalizedRequested,
    );

    if (!match) {
      throw new Error(`Offer PDF template not found: ${relativePath}`);
    }

    resolved = path.join(offersDir, match);
  }

  if (!resolved.startsWith(ASSETS_ROOT + path.sep) && resolved !== ASSETS_ROOT) {
    throw new Error("Invalid offer PDF template path.");
  }

  return resolved;
};

/** Reads the raw (unfilled) template bytes for a validated relative path. */
export const readOfferTemplateBytes = async (
  relativePath: string,
): Promise<Uint8Array> => {
  const filePath = await resolveOfferTemplatePath(relativePath);
  return new Uint8Array(await fs.readFile(filePath));
};

export interface OfferTemplateMeta {
  pageCount: number;
  /** Page dimensions in PDF points (first page). */
  width: number;
  height: number;
}

// Templates are static assets, so their page count/size never changes at
// runtime — memoize per instance to keep offer-page render cheap.
const templateMetaCache = new Map<string, OfferTemplateMeta>();

/**
 * Page count + first-page dimensions. Filling and flattening never change these,
 * so we read them straight from the (cheaper) raw template.
 */
export const readOfferTemplateMeta = async (
  relativePath: string,
): Promise<OfferTemplateMeta> => {
  const cached = templateMetaCache.get(relativePath);
  if (cached) {
    return cached;
  }

  const bytes = await readOfferTemplateBytes(relativePath);
  const pdfDoc = await PDFDocument.load(bytes, { updateMetadata: false });
  const firstPage = pdfDoc.getPage(0);
  const { width, height } = firstPage.getSize();
  const meta: OfferTemplateMeta = {
    pageCount: pdfDoc.getPageCount(),
    width: Math.round(width),
    height: Math.round(height),
  };
  templateMetaCache.set(relativePath, meta);
  return meta;
};

export const fillOfferPdfTemplate = async (
  relativePath: string,
  fields: Record<string, string>,
): Promise<Uint8Array> => {
  const filePath = await resolveOfferTemplatePath(relativePath);

  const [templateBytes, fontBytes] = await Promise.all([
    fs.readFile(filePath),
    fs.readFile(UNICODE_FONT_PATH),
  ]);

  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);
  const unicodeFont = await pdfDoc.embedFont(fontBytes, { subset: true });
  const form = pdfDoc.getForm();

  for (const [fieldName, value] of Object.entries(fields)) {
    try {
      form.getTextField(fieldName).setText(value);
    } catch {
      // Skip fields that are not present in this template.
    }
  }

  // Aptos matches the AcroForm DA font and supports Greek; Helvetica/WinAnsi does not.
  form.updateFieldAppearances(unicodeFont);
  form.flatten();
  return pdfDoc.save();
};
