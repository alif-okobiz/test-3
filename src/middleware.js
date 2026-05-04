import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(req) {
  const token = req.cookies.get("auth-token")?.value;
  const { pathname } = req.nextUrl;

  
  if (pathname === "/login" && token) {
    const payload = await verifyToken(token);
    if (payload) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  
  const protectedRoutes = ["/dashboard", "/agri-tickets", "/pet-tickets", "/all-tickets"];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } else {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};