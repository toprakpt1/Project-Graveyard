"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function ArchiveDialog({ projectId }: { projectId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleArchive() {
    setLoading(true)
    await supabase
      .from("projects")
      .update({ archived_at: new Date().toISOString(), last_updated_at: new Date().toISOString() })
      .eq("id", projectId)
    setLoading(false)
    setOpen(false)
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Archive
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive this project?</DialogTitle>
          <DialogDescription>
            It will be hidden from the main dashboard. You can restore it
            later from the archive view.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleArchive} disabled={loading}>
            {loading ? "Archiving..." : "Archive"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function RestoreButton({ projectId }: { projectId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleRestore() {
    setLoading(true)
    await supabase
      .from("projects")
      .update({ archived_at: null, last_updated_at: new Date().toISOString() })
      .eq("id", projectId)
    setLoading(false)
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRestore} disabled={loading}>
      {loading ? "Restoring..." : "Restore"}
    </Button>
  )
}
