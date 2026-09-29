import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { safeNextPath } from "@/modules/access/paths";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const path = req.nextUrl.pathname;
  if (!req.auth?.user) {
    const url = new URL("/login", req.nextUrl);
    url.searchParams.set("next", safeNextPath(`${path}${req.nextUrl.search}`));
    return NextResponse.redirect(url);
  }
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", path);
  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
