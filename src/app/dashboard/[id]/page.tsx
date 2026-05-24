import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { NoteTimeline } from "@/components/note-timeline"
import { STATUS_LABELS, STATUS_ICONS, STOPPED_REASONS } from "@/lib/constants"
import type { Project, ProjectNote } from "@/types"

export const dynamic = "force-dynamic"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: projectRaw } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single()

  const project = projectRaw as Project | null

  if (!project) {
    notFound()
  }

  const { data: notesRaw } = await supabase
    .from("project_notes")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false })

  const notes = notesRaw as ProjectNote[] | null

  const currentTime = new Date().getTime()
  const daysSinceUpdate = Math.floor(
    (currentTime - new Date(project.last_updated_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  const stoppedReasonLabel = project.stopped_reason
    ? STOPPED_REASONS.find((r) => r.value === project.stopped_reason)?.label
    : null

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{STATUS_ICONS[project.status]}</span>
            <h1 className="text-2xl font-bold">{project.name}</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {project.description ?? "No description"}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/dashboard/${project.id}/edit`}
            className="inline-flex h-7 items-center justify-center rounded-md border border-border bg-background px-2.5 text-[0.8rem] font-medium whitespace-nowrap text-foreground hover:bg-muted"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{STATUS_LABELS[project.status]}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-lg font-semibold">%{project.progress}</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {new Date(project.started_at).toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Updated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {daysSinceUpdate === 0
                ? "Today"
                : `${daysSinceUpdate} day${daysSinceUpdate === 1 ? "" : "s"} ago`}
            </p>
          </CardContent>
        </Card>
      </div>

      {project.goal && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{project.goal}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {(project.technologies as string[] | undefined)?.map((tech) => (
          <Badge key={tech} variant="secondary">
            {tech}
          </Badge>
        ))}
      </div>

      {project.github_repo_url && (
        <p className="text-sm">
          <a
            href={project.github_repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-primary"
          >
            View on GitHub →
          </a>
        </p>
      )}

      {stoppedReasonLabel && (
        <Card className="border-destructive/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive">
              Why Stopped?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{stoppedReasonLabel}</p>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-4">Journal / Notes</h2>
        <NoteTimeline projectId={project.id} notes={notes ?? []} />
      </div>
    </div>
  )
}
