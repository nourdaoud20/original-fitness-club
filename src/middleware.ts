import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  let isAuth = false;

  if (token) {
    try {
      await jwtVerify(token, secret);
      isAuth = true;
    } catch {
      isAuth = false;
    }
  }

  const { pathname } = req.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/register";
  
  // Les routes eli lezemhom compte (Adhérent, Coach, Admin, Réception)
  const isPrivateRoute = 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/coach") || 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/reception");

  // Ken y7eb yodkhol l'route privée w houwa mouch connecté -> Raja3 lel Login
  if (isPrivateRoute && !isAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Ken houwa connecté w y7eb yemchi lel Login/Register -> Hzzou lel Dashboard
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/coach/:path*", "/admin/:path*", "/reception/:path*", "/login", "/register"],
};