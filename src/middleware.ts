
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("dinedesk-session")?.value;
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!token) {
    if (isLoginPage) {
      return NextResponse.next();
    }

    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  try {
    const secret = process.env.SESSION_SECRET;

    if (!secret) {
      throw new Error("SESSION_SECRET is missing.");
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    if (payload.role !== "ADMIN") {
      throw new Error("Unauthorized role.");
    }

    if (isLoginPage) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(
      new URL("/admin/login", request.url)
    );

    response.cookies.delete("dinedesk-session");
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
