"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { PinIcon, PinOffIcon } from "lucide-react"

export function PinButton({
  projectId,
  pinned,
}: {
  projectId: string
  pinned: boolean
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const now = pinned ? null : new Date().toISOString()
    await supabase
      .from("projects")
      .update({ pinned: !pinned, pinned_at: now, last_updated_at: new Date().toISOString() })
      .eq("id", projectId)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="inline-flex h-7 items-center justify-center rounded-md border border-border bg-background px-2 text-[0.8rem] font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
      title={pinned ? "Unpin" : "Pin"}
    >
      {pinned ? <PinOffIcon className="size-3.5" /> : <PinIcon className="size-3.5" />}
    </button>
  )
}
