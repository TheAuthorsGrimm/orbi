import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "orbi_session";

const PROTECTED_PREFIXES = ["/app", "/tasks", "/chat", "/settings"];
const AUTH_PAGES = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const hasValidSession = token ? await verify(token) : false;

  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) && !hasValidSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (AUTH_PAGES.includes(pathname) && hasValidSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/tasks";
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

async function verify(token: string): Promise<boolean> {
  const s = process.env.AUTH_SECRET;
  if (!s) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(s));
    return true;
  } catch {
    return false;
  }
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/stripe/webhook).*)"],
};
