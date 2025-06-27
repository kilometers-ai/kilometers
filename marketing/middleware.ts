import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const useExternalApp = process.env.NEXT_PUBLIC_USE_EXTERNAL_APP === "true"
  const externalAppUrl = process.env.NEXT_PUBLIC_EXTERNAL_APP_URL || "https://app.kilometers.ai"

  // Routes that should redirect to external app when feature flag is enabled
  const appRoutes = ["/dashboard", "/onboarding", "/billing"]

  if (useExternalApp && appRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    const redirectUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, externalAppUrl)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/billing/:path*"],
}
