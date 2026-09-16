import { LocaleProvider } from "@/lib/LocaleContext";
import { getServerLocale } from "@/lib/i18n/server";

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getServerLocale();

  return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
}
