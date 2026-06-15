import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE, ROLES } from "@/config/constants";

const PUBLIC_ROUTES = ["/login", "/register"];

const ADMIN_ONLY_PREFIXES = [
  "/settings/users",
  "/settings/custom-fields",
  "/settings/business-profile",
];

const WRITE_ROUTE_PREFIXES = [
  "/clients/new",
  "/payments/new",
  "/settings/payment-methods",
  "/settings/payment-statuses",
];

function isPublicRoute(pathname) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function matchesPrefix(pathname, prefixes) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

async function getSessionFromRequest(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !process.env.JWT_SECRET) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const session = await getSessionFromRequest(request);
  const isPublic = isPublicRoute(pathname);

  if (isPublic) {
    if (session && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/clients") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings");

  if (!session && isProtectedRoute) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!session) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    matchesPrefix(pathname, ADMIN_ONLY_PREFIXES) &&
    session.role !== ROLES.ADMIN
  ) {
    return NextResponse.redirect(
      new URL("/dashboard?error=forbidden", request.url)
    );
  }

  if (
    matchesPrefix(pathname, WRITE_ROUTE_PREFIXES) &&
    session.role === ROLES.VIEWER
  ) {
    return NextResponse.redirect(
      new URL("/dashboard?error=forbidden", request.url)
    );
  }

  return NextResponse.next();
}

/** Only app routes — never match /_next, static files, or public assets */
export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/clients/:path*",
    "/payments/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
