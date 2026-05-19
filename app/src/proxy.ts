import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  })

  const isLoggedIn = !!token
  const { pathname } = request.nextUrl

  if (!isLoggedIn && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.nextUrl.origin))
  }

  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin))
  }

  if (pathname.startsWith("/validate")) {
    const role = token?.role as string | undefined
    if (role !== "VALIDATOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
