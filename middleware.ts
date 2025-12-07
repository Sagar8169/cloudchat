import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Allow access to public routes
  const publicRoutes = ["/", "/landing", "/auth", "/pricing"]
  const path = request.nextUrl.pathname

  if (publicRoutes.includes(path)) {
    return NextResponse.next()
  }

  // For protected routes, just allow them through
  // Firebase handles auth on the client side
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
