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

export function RestartButton({ projectId }: { projectId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRestart() {
    setLoading(true)
    await supabase
      .from("projects")
      .update({
        status: "active",
        stopped_reason: null,
        restarted_at: new Date().toISOString(),
        last_updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)

    await supabase.from("project_notes").insert({
      project_id: projectId,
      content: "Restarted this project.",
    })

    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="default" size="sm" />}>
        Restart
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restart this project?</DialogTitle>
          <DialogDescription>
            Setting it back to active will record a restart date and clear the
            stopped reason. A note will be added to the journal.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleRestart} disabled={loading}>
            {loading ? "Restarting..." : "Restart"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
