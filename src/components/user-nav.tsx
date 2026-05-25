"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from "@supabase/supabase-js"

export function UserNav({ user }: { user: User | null }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  if (!user) return null

  const initials = user.email?.charAt(0).toUpperCase() ?? "?"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <div className="relative h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-w-[calc(100vw-1rem)]" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex min-w-0 flex-col space-y-1">
              <p
                className="truncate text-sm font-medium leading-none"
                title={user.email ?? undefined}
              >
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
