import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

// Define protected routes
const protectedRoutes = {
  admin: ["/admin"],
  hr: ["/hr"],
  employee: ["/employee"],
};

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isAdminRoute = protectedRoutes.admin.some((route) => path.startsWith(route));
  const isHrRoute = protectedRoutes.hr.some((route) => path.startsWith(route));
  const isEmployeeRoute = protectedRoutes.employee.some((route) => path.startsWith(route));

  if (!isAdminRoute && !isHrRoute && !isEmployeeRoute) {
    // Not a protected route, let it pass (e.g. login page, api, _next)
    return NextResponse.next();
  }

  const cookie = req.cookies.get("erflow_session")?.value;
  const session = await decrypt(cookie);

  // 1. Not logged in
  if (!session?.employeeId) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // 2. Role-based routing enforcement
  const role = session.role;

  if (isAdminRoute && role !== "ADMIN") {
    // If HR tries to access Admin
    if (role === "HR") {
      // Grant HR access to specific Admin pages
      if (path.startsWith("/admin/employees") || path.startsWith("/admin/analytics")) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/hr", req.nextUrl));
    }
    // If Employee tries to access Admin
    return NextResponse.redirect(new URL("/employee", req.nextUrl));
  }

  if (isHrRoute && role !== "HR" && role !== "ADMIN") {
    // Admin can access HR, but Employee cannot
    return NextResponse.redirect(new URL("/employee", req.nextUrl));
  }

  if (isEmployeeRoute && role !== "EMPLOYEE" && role !== "ADMIN" && role !== "HR") {
    // Fallback
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
