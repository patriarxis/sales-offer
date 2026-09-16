import type { Pricing } from "@/features/offer/model/offer.types";

export const hasValue = (value: unknown): boolean =>
  value !== null && value !== undefined && value !== "";

/** Unwraps CRM money objects (`{ value: 9 }`, `{ amount: 9 }`, etc.). */
export const coerceOfferValue = (value: unknown): unknown => {
  if (!hasValue(value)) {
    return value;
  }

  if (typeof value === "number" || typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    for (const key of ["value", "amount", "Value", "Amount"]) {
      if (hasValue(record[key])) {
        return coerceOfferValue(record[key]);
      }
    }
  }

  return value;
};

export const hasOfferValue = (value: unknown): boolean => {
  const coerced = coerceOfferValue(value);
  if (!hasValue(coerced)) {
    return false;
  }
  if (typeof coerced === "number") {
    return Number.isFinite(coerced);
  }
  if (typeof coerced === "string") {
    return /[\d]/.test(coerced);
  }
  return false;
};

export const formatAmount = (value: unknown): string => {
  const coerced = coerceOfferValue(value);
  if (typeof coerced === "number" && Number.isFinite(coerced)) {
    const formatted = coerced.toLocaleString("el-GR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return `${formatted} €`;
  }
  if (typeof coerced === "string" && coerced.trim()) {
    return coerced.trim();
  }
  return "-";
};

/** Commission fields that are percentages, not currency. */
const PERCENTAGE_PRICING_KEYS = new Set([
  "goforeatcommission",
  "giftcommission",
  "goforeatdigitalcommission",
  "giftdigitalcommission",
  "flexonecommissionservicecost",
  "chequedejeunercommission",
  "chequedejeunercostoflatereturn",
]);

export const isPercentagePricingKey = (key: string): boolean =>
  PERCENTAGE_PRICING_KEYS.has(key.toLowerCase());

export const formatPercent = (value: unknown): string => {
  const coerced = coerceOfferValue(value);
  if (typeof coerced === "number" && Number.isFinite(coerced)) {
    const formatted = coerced.toLocaleString("el-GR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return `${formatted} %`;
  }
  if (typeof coerced === "string" && coerced.trim()) {
    const trimmed = coerced.trim();
    if (/%\s*$/.test(trimmed)) {
      return trimmed;
    }
    return `${trimmed} %`;
  }
  return "-";
};

export const formatPricingValue = (key: string, value: unknown): string =>
  isPercentagePricingKey(key) ? formatPercent(value) : formatAmount(value);

export const matchesKey = (key: string, expected: string): boolean =>
  key.toLowerCase() === expected.toLowerCase();

export const findEntry = (
  row: Record<string, unknown>,
  matcher: (key: string) => boolean,
): [string, unknown] | null => {
  for (const [key, value] of Object.entries(row)) {
    if (matcher(key) && hasValue(value)) {
      return [key, value];
    }
  }
  return null;
};

export const findByAliases = (
  row: Record<string, unknown>,
  aliases: readonly string[],
): [string, unknown] | null => {
  for (const alias of aliases) {
    const entry = findEntry(row, (key) => matchesKey(key, alias));
    if (entry) {
      return entry;
    }
  }
  return null;
};

export const pushPricingRow = (
  pricing: Pricing[],
  outputKey: string,
  value: unknown,
): void => {
  if (!hasOfferValue(value)) {
    return;
  }
  pricing.push({
    key: outputKey,
    category: outputKey,
    monthly: formatPricingValue(outputKey, value),
  });
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Merges nested CRM objects into a flat key map for field lookup. */
export const flattenOfferFields = (
  source: Record<string, unknown>,
  depth = 0,
): Record<string, unknown> => {
  if (depth > 4) {
    return { ...source };
  }

  const flat: Record<string, unknown> = { ...source };

  const visit = (obj: Record<string, unknown>, prefix = "") => {
    for (const [key, value] of Object.entries(obj)) {
      const combinedKey = prefix
        ? `${prefix}${key.charAt(0).toUpperCase()}${key.slice(1)}`
        : key;

      if (Array.isArray(value)) {
        for (const item of value) {
          if (isPlainObject(item)) {
            visit(item, combinedKey);
          }
        }
        continue;
      }

      if (isPlainObject(value)) {
        visit(value, combinedKey);
        flat[key] = value;
        continue;
      }

      flat[combinedKey] = value;
      if (!prefix) {
        flat[key] = value;
      }
    }
  };

  visit(source);
  return flat;
};

export const mergePricingByKey = (...groups: Pricing[][]): Pricing[] => {
  const merged = new Map<string, Pricing>();

  for (const group of groups) {
    for (const row of group) {
      const id = row.key ?? row.category;
      merged.set(id, row);
    }
  }

  return Array.from(merged.values());
};
