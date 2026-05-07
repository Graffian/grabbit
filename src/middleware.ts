import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/onboarding");

  const protectedPaths = [
    "/dashboard",
    "/list-item",
    "/bookings",
    "/disputes",
    "/admin",
  ];

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/browse", req.url));
  }

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|uploads).*)",
  ],
};
