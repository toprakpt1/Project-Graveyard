import Link from "next/link"
import { LayoutDashboard, Plus, Settings, Skull } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { buttonVariants } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-base font-semibold">
            <Skull className="size-5" />
            Project Graveyard
          </Link>
          <div className="flex items-center gap-1.5">
            <Link
              href="/dashboard"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/new"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Plus className="size-4" />
              New
            </Link>
            <Link
              href="/dashboard/settings"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              <Settings className="size-4" />
              Settings
            </Link>
            <UserNav user={user} />
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
    </div>
  )
}
