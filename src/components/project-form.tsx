"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { STOPPED_REASONS, STATUS_LABELS } from "@/lib/constants"
import { parseProjectTags, SUGGESTED_PROJECT_TAGS } from "@/lib/tags"
import type { Project, ProjectStatus, StoppedReason } from "@/types"

const STATUS_OPTIONS: ProjectStatus[] = ["active", "paused", "abandoned", "completed"]
const RESURRECTABLE_STATUSES: ProjectStatus[] = ["paused", "abandoned"]

export function ProjectForm({ project }: { project: Project }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResurrectDialog, setShowResurrectDialog] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState<() => Promise<void>>()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const status = form.get("status") as ProjectStatus
    const isResurrecting =
      RESURRECTABLE_STATUSES.includes(project.status) && status === "active"

    async function doSubmit() {
      const name = form.get("name") as string
      const description = form.get("description") as string
      const goal = form.get("goal") as string
      const technologies = (form.get("technologies") as string)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
      const tags = parseProjectTags(form.get("tags") as string)
      const githubRepoUrl = form.get("github_repo_url") as string
      const progress = parseInt(form.get("progress") as string) || 0
      const safeProgress = Math.min(100, Math.max(0, progress))
      const stoppedReason = form.get("stopped_reason") as StoppedReason | ""
      const now = new Date().toISOString()

      // Input uzunluk doğrulaması
      if (name.length > 200) {
        setError("Project name must be under 200 characters.")
        setLoading(false)
        return
      }
      if (description.length > 5000) {
        setError("Description must be under 5,000 characters.")
        setLoading(false)
        return
      }
      if (goal.length > 2000) {
        setError("Goal must be under 2,000 characters.")
        setLoading(false)
        return
      }

      const updates: Record<string, unknown> = {
        name,
        description: description || null,
        goal: goal || null,
        technologies,
        tags,
        github_repo_url: githubRepoUrl || null,
        status,
        progress: safeProgress,
        last_updated_at: now,
      }

      if (isResurrecting) {
        updates.stopped_reason = null
        updates.restarted_at = now
      } else {
        updates.stopped_reason = stoppedReason || null
      }

      const { error: updateError } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", project.id)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      if (isResurrecting) {
        await supabase.from("project_notes").insert({
          project_id: project.id,
          content: "Restarted this project.",
        })
      }

      const eventType = isResurrecting
        ? "resurrected"
        : status !== project.status
          ? "status_change"
          : safeProgress !== project.progress
            ? "progress_update"
            : null

      if (eventType) {
        await supabase.from("project_status_events").insert({
          project_id: project.id,
          event_type: eventType,
          from_status: project.status,
          to_status: status,
          progress: safeProgress,
          note: getStatusEventNote(eventType),
          happened_at: now,
        })
      }

      router.push(`/dashboard/${project.id}`)
      router.refresh()
    }

    if (isResurrecting) {
      setPendingSubmit(() => doSubmit)
      setShowResurrectDialog(true)
      setLoading(false)
    } else {
      await doSubmit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Basic information about your project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={project.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={project.description ?? ""}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Goal</Label>
            <Textarea
              id="goal"
              name="goal"
              defaultValue={project.goal ?? ""}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technologies">Technologies</Label>
            <Input
              id="technologies"
              name="technologies"
              defaultValue={project.technologies?.join(", ") ?? ""}
              placeholder="React, Supabase, Expo (comma-separated)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={project.tags?.join(", ") ?? ""}
              placeholder="#idea, #mvp, #tutorial"
            />
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROJECT_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="github_repo_url">GitHub Repo URL</Label>
            <Input
              id="github_repo_url"
              name="github_repo_url"
              type="url"
              defaultValue={project.github_repo_url ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status & Progress</CardTitle>
          <CardDescription>Current state of your project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={project.status}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="progress">Progress (%)</Label>
            <Input
              id="progress"
              name="progress"
              type="number"
              min={0}
              max={100}
              defaultValue={project.progress}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stopped_reason">Why Stopped?</Label>
            <Select
              name="stopped_reason"
              defaultValue={project.stopped_reason ?? ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not selected</SelectItem>
                {STOPPED_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>

      <Dialog open={showResurrectDialog} onOpenChange={setShowResurrectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restart this project?</DialogTitle>
            <DialogDescription>
              This project was {STATUS_LABELS[project.status].toLowerCase()}.
              Setting it back to active will record a restart date and clear
              the stopped reason. A note will be added to the journal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResurrectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={async () => {
                setShowResurrectDialog(false)
                setLoading(true)
                await pendingSubmit?.()
              }}
            >
              Restart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}

function getStatusEventNote(eventType: "resurrected" | "status_change" | "progress_update") {
  switch (eventType) {
    case "resurrected":
      return "Project returned to active work."
    case "status_change":
      return "Project status was updated."
    case "progress_update":
      return "Project progress was updated."
  }
}
