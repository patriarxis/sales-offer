import { LocaleProvider } from "@/lib/LocaleContext";
import { getServerLocale } from "@/lib/i18n/server";
import { NotFoundScreen } from "@/screens/NotFoundScreen/NotFoundScreen";

export default async function RootNotFound() {
  const locale = await getServerLocale();

  return (
    <LocaleProvider locale={locale}>
      <NotFoundScreen />
    </LocaleProvider>
  );
}
