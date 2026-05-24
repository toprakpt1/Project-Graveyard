import Link from "next/link"
import { Skull, LogIn, UserPlus, LayoutDashboard } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"

export function PublicNav({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Skull className="size-5" />
          Project Graveyard
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <Link
              href="/dashboard"
              className={buttonVariants({ variant: "outline" })}
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "outline" })}
              >
                <LogIn className="size-4" />
                Sign In
              </Link>
              <Link
                href="/register"
                className={buttonVariants({ variant: "default" })}
              >
                <UserPlus className="size-4" />
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
