import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Admin-only routes
    if (pathname.startsWith("/dashboard/settings") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Client users can only access their own client page
    if (
      token?.role === "client" &&
      pathname.startsWith("/dashboard/") &&
      pathname !== "/dashboard"
    ) {
      const clientId = pathname.split("/")[2];
      if (clientId && clientId !== token.clientId) {
        return NextResponse.redirect(
          new URL(`/dashboard/${token.clientId}`, req.url)
        );
      }
    }

    // Redirect client users away from agency view
    if (token?.role === "client" && pathname === "/dashboard") {
      return NextResponse.redirect(
        new URL(`/dashboard/${token.clientId}`, req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/api/data/:path*", "/api/clients/:path*", "/api/users/:path*"],
};
