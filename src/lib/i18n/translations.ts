import { LOCALE } from "@/enums/locale";
import { ILocale, ITranslations } from "@/types/i18n";
import en from "@/locales/en.json";
import el from "@/locales/el.json";

const translationRegistry: Record<ILocale, ITranslations> = {
  [LOCALE.EL]: el,
  [LOCALE.EN]: en,
};

export function getITranslations(locale: ILocale): ITranslations {
  return translationRegistry[locale] || translationRegistry[LOCALE.EN];
}

export function hasITranslations(locale: string): boolean {
  return Object.values(LOCALE).includes(locale as ILocale);
}

export function createTranslator(locale: ILocale) {
  const translations = getITranslations(locale);

  /* Get a translation by key path */
  const t = (key: string, context?: string): any => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dict: any = translations;

    if (context) {
      if (dict[context] && dict[context][key] !== undefined) {
        return dict[context][key];
      }
      return key;
    }

    const keys = key.split(".");
    let value: any = dict;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    return value !== undefined ? value : key;
  };

  return {
    t,
    locale,
    translations,
  };
}
