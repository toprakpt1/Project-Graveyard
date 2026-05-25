"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ProjectMilestone, ProjectStatus } from "@/types"

export function ProjectMilestones({
  projectId,
  projectStatus,
  projectProgress,
  milestones: initialMilestones,
}: {
  projectId: string
  projectStatus: ProjectStatus
  projectProgress: number
  milestones: ProjectMilestone[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [milestones, setMilestones] = useState(initialMilestones)
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const milestoneProgress =
    milestones.length === 0 ? projectProgress : calculateMilestoneProgress(milestones)

  async function syncProjectProgress(
    nextMilestones: ProjectMilestone[],
    previousProgress: number
  ) {
    if (nextMilestones.length === 0) return

    const nextProgress = calculateMilestoneProgress(nextMilestones)
    const updatedAt = new Date().toISOString()

    await supabase
      .from("projects")
      .update({
        progress: nextProgress,
        last_updated_at: updatedAt,
      })
      .eq("id", projectId)

    if (nextProgress !== previousProgress) {
      await supabase.from("project_status_events").insert({
        project_id: projectId,
        event_type: "progress_update",
        from_status: projectStatus,
        to_status: projectStatus,
        progress: nextProgress,
        note: "Milestone checklist updated progress.",
        happened_at: updatedAt,
      })
    }
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)

    const nextPosition =
      milestones.length === 0
        ? 0
        : Math.max(...milestones.map((milestone) => milestone.position)) + 1

    const { data, error: insertError } = await supabase
      .from("project_milestones")
      .insert({
        project_id: projectId,
        title: trimmed,
        position: nextPosition,
      })
      .select()
      .single()

    if (insertError || !data) {
      setError(insertError?.message ?? "Milestone could not be added.")
      setLoading(false)
      return
    }

    const nextMilestones = [...milestones, data as ProjectMilestone]
    setMilestones(nextMilestones)
    setTitle("")
    await syncProjectProgress(nextMilestones, milestoneProgress)
    setLoading(false)
    router.refresh()
  }

  async function handleToggle(milestone: ProjectMilestone) {
    const completed = !milestone.completed
    const previousProgress = milestoneProgress
    const nextMilestones = milestones.map((item) =>
      item.id === milestone.id
        ? {
            ...item,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          }
        : item
    )

    setMilestones(nextMilestones)
    setError(null)

    const { error: updateError } = await supabase
      .from("project_milestones")
      .update({
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq("id", milestone.id)

    if (updateError) {
      setMilestones(milestones)
      setError(updateError.message)
      return
    }

    await syncProjectProgress(nextMilestones, previousProgress)
    router.refresh()
  }

  async function handleDelete(milestone: ProjectMilestone) {
    const previousProgress = milestoneProgress
    const nextMilestones = milestones.filter((item) => item.id !== milestone.id)

    setMilestones(nextMilestones)
    setError(null)

    const { error: deleteError } = await supabase
      .from("project_milestones")
      .delete()
      .eq("id", milestone.id)

    if (deleteError) {
      setMilestones(milestones)
      setError(deleteError.message)
      return
    }

    await syncProjectProgress(nextMilestones, previousProgress)
    router.refresh()
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Milestones</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {milestones.length === 0
                ? "Add checklist items to calculate progress from completed milestones."
                : `${milestones.filter((item) => item.completed).length} of ${milestones.length} completed.`}
            </p>
          </div>
          <p className="text-sm font-medium tabular-nums">{milestoneProgress}%</p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-sm bg-secondary">
          <div
            className="h-full rounded-sm bg-primary"
            style={{ width: `${milestoneProgress}%` }}
          />
        </div>
      </div>

      <div className="divide-y">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className="flex min-h-11 items-center gap-3 px-4 py-2"
          >
            <input
              type="checkbox"
              checked={milestone.completed}
              onChange={() => handleToggle(milestone)}
              className="size-4 rounded border-input accent-foreground"
              aria-label={`Mark ${milestone.title} as ${milestone.completed ? "incomplete" : "complete"}`}
            />
            <p
              className={[
                "min-w-0 flex-1 text-sm",
                milestone.completed ? "text-muted-foreground line-through" : "",
              ].join(" ")}
            >
              {milestone.title}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => handleDelete(milestone)}
              aria-label={`Delete ${milestone.title}`}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 border-t p-4">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a milestone"
        />
        <Button type="submit" disabled={loading || !title.trim()}>
          {loading ? "Adding..." : "Add"}
        </Button>
      </form>

      {error && <p className="border-t p-4 text-sm text-destructive">{error}</p>}
    </div>
  )
}

function calculateMilestoneProgress(milestones: ProjectMilestone[]): number {
  if (milestones.length === 0) return 0

  const completed = milestones.filter((milestone) => milestone.completed).length
  return Math.round((completed / milestones.length) * 100)
}
