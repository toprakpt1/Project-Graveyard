import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { UserNav } from "@/components/user-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            🪦 Project Graveyard
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/new"
              className="inline-flex h-7 items-center justify-center rounded-md border border-border bg-background px-2.5 text-[0.8rem] font-medium whitespace-nowrap text-foreground hover:bg-muted"
            >
              + Yeni Proje
            </Link>
            <UserNav user={user} />
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
    </div>
  )
}
