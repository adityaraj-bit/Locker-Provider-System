import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("JWT_SECRET missing (build phase)");
}
const secret = new TextEncoder().encode(JWT_SECRET || "build_safe_secret");

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;

  // Public routes
  const publicRoutes = ["/login", "/register", "/"];

  if (publicRoutes.some(route => pathname === route || pathname.startsWith("/api/auth"))) {
    return NextResponse.next();
  }

  // No token → force login
  if (!token) {
    if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    // Admin Routes
    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Store Owner Routes
    if (pathname.startsWith("/dashboard/store") && role !== "STORE_OWNER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Student Routes
    if (pathname.startsWith("/dashboard/student") && role !== "STUDENT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bookings/:path*",
    "/stores/:path*",
    "/admin/:path*",
  ],
};