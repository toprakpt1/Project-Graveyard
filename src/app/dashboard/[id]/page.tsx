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
import { ActivityHeatmap } from "@/components/activity-heatmap"
import { NoteTimeline } from "@/components/note-timeline"
import { ProgressTimeline } from "@/components/progress-timeline"
import { ProjectMilestones } from "@/components/project-milestones"
import { ArchiveDialog, RestoreButton } from "@/components/archive-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { PinButton } from "@/components/pin-button"
import { RestartButton } from "@/components/restart-button"
import { AiAnalysisPanel } from "@/components/ai-analysis-panel"
import { STATUS_LABELS, STATUS_ICONS, STOPPED_REASONS } from "@/lib/constants"
import type {
  Project,
  ProjectMilestone,
  ProjectNote,
  ProjectStatusEvent,
} from "@/types"

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

  const { data: milestonesRaw } = await supabase
    .from("project_milestones")
    .select("*")
    .eq("project_id", id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true })

  const milestones = milestonesRaw as ProjectMilestone[] | null

  const { data: statusEventsRaw } = await supabase
    .from("project_status_events")
    .select("*")
    .eq("project_id", id)
    .order("happened_at", { ascending: true })

  const statusEvents = statusEventsRaw as ProjectStatusEvent[] | null
  const timelineEvents =
    statusEvents && statusEvents.length > 0
      ? statusEvents
      : buildFallbackTimeline(project)
  const activityDates = [
    project.created_at,
    project.last_updated_at,
    project.restarted_at,
    project.archived_at,
    ...(notes ?? []).map((note) => note.created_at),
    ...timelineEvents.map((event) => event.happened_at),
  ].filter(Boolean) as string[]

  const currentTime = new Date().getTime()
  const daysSinceUpdate = Math.floor(
    (currentTime - new Date(project.last_updated_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  const stoppedReasonLabel = project.stopped_reason
    ? STOPPED_REASONS.find((r) => r.value === project.stopped_reason)?.label
    : null

  const isArchived = project.archived_at !== null

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {project.pinned && (
              <span className="text-muted-foreground" title="Pinned">📌</span>
            )}
            <span className="text-2xl">{STATUS_ICONS[project.status]}</span>
            <h1 className="text-2xl font-bold">{project.name}</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {project.description ?? "No description"}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <PinButton projectId={project.id} pinned={project.pinned} />
          {isArchived ? (
            <>
              <RestoreButton
                projectId={project.id}
                currentStatus={project.status}
                projectProgress={project.progress}
              />
              <DeleteDialog projectId={project.id} />
            </>
          ) : (
            <>
              {(project.status === "abandoned" || project.status === "paused") && (
                <RestartButton
                  projectId={project.id}
                  currentStatus={project.status}
                  projectProgress={project.progress}
                />
              )}
              <Link
                href={`/dashboard/${project.id}/edit`}
                className="inline-flex h-7 items-center justify-center rounded-md border border-border bg-background px-2.5 text-[0.8rem] font-medium whitespace-nowrap text-foreground hover:bg-muted"
              >
                Edit
              </Link>
              <ArchiveDialog
                projectId={project.id}
                currentStatus={project.status}
                projectProgress={project.progress}
              />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-lg font-semibold">{STATUS_LABELS[project.status]}</p>
            {project.restarted_at && (
              <p className="text-xs text-muted-foreground">
                Restarted{" "}
                {new Date(project.restarted_at).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
            {isArchived && (
              <p className="text-xs text-muted-foreground">
                Archived{" "}
                {new Date(project.archived_at!).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
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
        {(project.tags as string[] | undefined)?.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
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

      {project.github_repo_id && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              GitHub Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Repository</p>
                <p className="mt-1 font-medium">
                  {project.github_full_name ?? project.github_repo_url}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Last commit</p>
                <p className="mt-1 font-medium">
                  {formatGitHubDate(project.github_last_commit_at)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Default branch</p>
                <p className="mt-1 font-medium">
                  {project.github_default_branch ?? "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Commit SHA</p>
                <p className="mt-1 font-medium">
                  {project.github_last_commit_sha
                    ? project.github_last_commit_sha.slice(0, 7)
                    : "Unknown"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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

      <AiAnalysisPanel
        projectId={project.id}
        projectName={project.name}
        projectContext={`Project: ${project.name}
Description: ${project.description ?? "none"}
Status: ${project.status}
Progress: ${project.progress}%
Technologies: ${(project.technologies ?? []).join(", ")}
Tags: ${(project.tags ?? []).join(", ")}

${project.github_repo_id ? `GitHub: ${project.github_full_name ?? ""}
Last commit: ${project.github_last_commit_at ?? "unknown"}
Last push: ${project.github_last_pushed_at ?? "unknown"}
Stars: ${project.github_stars}
Open issues: ${project.github_open_issues}` : ""}

Stopped reason: ${stoppedReasonLabel ?? "none"}
Started: ${new Date(project.started_at).toLocaleDateString()}`}
      />

      <ProjectMilestones
        projectId={project.id}
        projectStatus={project.status}
        projectProgress={project.progress}
        milestones={milestones ?? []}
      />

      <ActivityHeatmap
        title="Project Activity"
        activityDates={activityDates}
      />

      <ProgressTimeline events={timelineEvents} />

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-4">Journal / Notes</h2>
        <NoteTimeline projectId={project.id} notes={notes ?? []} />
      </div>
    </div>
  )
}

function formatGitHubDate(value: string | null): string {
  if (!value) return "Unknown"

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function buildFallbackTimeline(project: Project): ProjectStatusEvent[] {
  const events: ProjectStatusEvent[] = [
    {
      id: `${project.id}-created`,
      project_id: project.id,
      event_type: "created",
      from_status: null,
      to_status: project.restarted_at ? "active" : project.status,
      progress: 0,
      note: "Project was added to the graveyard.",
      happened_at: project.started_at ?? project.created_at,
      created_at: project.created_at,
    },
  ]

  if (project.restarted_at) {
    events.push({
      id: `${project.id}-restarted`,
      project_id: project.id,
      event_type: "resurrected",
      from_status: project.stopped_reason ? "abandoned" : "paused",
      to_status: "active",
      progress: project.progress,
      note: "Project returned to active work.",
      happened_at: project.restarted_at,
      created_at: project.restarted_at,
    })
  }

  if (project.archived_at) {
    events.push({
      id: `${project.id}-archived`,
      project_id: project.id,
      event_type: "archived",
      from_status: project.status,
      to_status: project.status,
      progress: project.progress,
      note: "Project was archived.",
      happened_at: project.archived_at,
      created_at: project.archived_at,
    })
  }

  if (
    project.last_updated_at !== project.started_at &&
    project.last_updated_at !== project.restarted_at &&
    project.last_updated_at !== project.archived_at
  ) {
    events.push({
      id: `${project.id}-updated`,
      project_id: project.id,
      event_type: "progress_update",
      from_status: project.status,
      to_status: project.status,
      progress: project.progress,
      note: "Latest saved project state.",
      happened_at: project.last_updated_at,
      created_at: project.last_updated_at,
    })
  }

  return events.sort(
    (a, b) => new Date(a.happened_at).getTime() - new Date(b.happened_at).getTime()
  )
}
