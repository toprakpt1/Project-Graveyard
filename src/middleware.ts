import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

const RATE_LIMIT_WINDOW = 60_000 // 1 dakika
const RATE_LIMIT_MAX = 10       // maksimum 10 istek
const ipRequests = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(request: NextRequest): boolean {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown"
  const now = Date.now()
  const entry = ipRequests.get(ip)

  if (!entry || now > entry.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return false
  }

  entry.count++
  return entry.count > RATE_LIMIT_MAX
}

export async function middleware(request: NextRequest) {
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register")

  if (isAuthPage && request.method === "POST") {
    if (isRateLimited(request)) {
      return new NextResponse("Too many requests", { status: 429 })
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
