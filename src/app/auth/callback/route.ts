import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function isSafeRedirect(origin: string, next: string): boolean {
  if (!next.startsWith("/")) return false
  if (next.startsWith("//")) return false
  try {
    const url = new URL(next, origin)
    return url.origin === origin
  } catch {
    return false
  }
}

function sanitizeNextParam(next: string | null): string {
  if (!next) return "/dashboard"
  if (!next.startsWith("/")) return "/dashboard"
  if (next.startsWith("//")) return "/dashboard"
  if (next.startsWith("/\\")) return "/dashboard"
  return next
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = sanitizeNextParam(searchParams.get("next"))

  if (!isSafeRedirect(origin, next)) {
    return NextResponse.redirect(`${origin}/login?error=invalid_redirect`)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
