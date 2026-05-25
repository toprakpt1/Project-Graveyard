"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import type { ProjectStatus } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function ArchiveDialog({
  projectId,
  currentStatus,
  projectProgress,
}: {
  projectId: string
  currentStatus: ProjectStatus
  projectProgress: number
}) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleArchive() {
    setLoading(true)
    const now = new Date().toISOString()
    await supabase
      .from("projects")
      .update({ archived_at: now, last_updated_at: now })
      .eq("id", projectId)
    await supabase.from("project_status_events").insert({
      project_id: projectId,
      event_type: "archived",
      from_status: currentStatus,
      to_status: currentStatus,
      progress: projectProgress,
      note: "Project was archived.",
      happened_at: now,
    })
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

export function RestoreButton({
  projectId,
  currentStatus,
  projectProgress,
}: {
  projectId: string
  currentStatus: ProjectStatus
  projectProgress: number
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleRestore() {
    setLoading(true)
    const now = new Date().toISOString()
    await supabase
      .from("projects")
      .update({ archived_at: null, last_updated_at: now })
      .eq("id", projectId)
    await supabase.from("project_status_events").insert({
      project_id: projectId,
      event_type: "restored",
      from_status: currentStatus,
      to_status: currentStatus,
      progress: projectProgress,
      note: "Project was restored from archive.",
      happened_at: now,
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRestore} disabled={loading}>
      {loading ? "Restoring..." : "Restore"}
    </Button>
  )
}
