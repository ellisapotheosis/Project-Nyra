import { NextRequest, NextResponse } from "next/server";

// Routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/broker", "/ops", "/tools", "/admin"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if accessing a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if accessing a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  // Get session token from cookies
  const sessionToken =
    request.cookies.get("sb-session")?.value ||
    request.cookies.get("sb-access-token")?.value;

  // If trying to access protected route without session, redirect to login
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth pages while authenticated, redirect to dashboard
  if ((pathname.startsWith("/auth/") || pathname === "/") && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
