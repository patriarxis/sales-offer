import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_HEADER, splitLocaleFromPath } from "@/lib/i18n/config";

export function proxy(request: NextRequest) {
  const { locale } = splitLocaleFromPath(request.nextUrl.pathname);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!api|_next|assets|favicon.ico|site.webmanifest|.*\\..*).*)"],
};

