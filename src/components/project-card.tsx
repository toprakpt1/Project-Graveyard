import Link from "next/link"
import { STATUS_LABELS } from "@/lib/constants"
import type { Project, ProjectStatus } from "@/types"

export function ProjectCard({
  project,
  currentTime,
}: {
  project: Project
  currentTime: number
}) {
  const daysSinceUpdate = Math.floor(
    (currentTime - new Date(project.last_updated_at).getTime()) / (1000 * 60 * 60 * 24)
  )
  const technologies = project.technologies ?? []
  const progress = Math.min(100, Math.max(0, project.progress))

  return (
    <Link
      href={`/dashboard/${project.id}`}
      className="block p-4 transition-colors hover:bg-muted/50"
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px_120px] md:items-center">
        <div className="min-w-0 space-y-2">
          <div className="flex min-w-0 items-center gap-3">
            <h2 className="truncate text-base font-medium">{project.name}</h2>
            <span
              className={[
                "shrink-0 text-sm",
                getStatusClass(project.status),
              ].join(" ")}
            >
              {STATUS_LABELS[project.status]}
            </span>
          </div>
          <p className="line-clamp-2 max-w-2xl text-sm leading-5 text-muted-foreground">
            {project.description ?? "No description"}
          </p>
          {project.github_full_name && (
            <p className="truncate text-xs text-muted-foreground">
              GitHub: {project.github_full_name}
            </p>
          )}
          {technologies.length > 0 && (
            <p className="truncate text-xs text-muted-foreground">
              {technologies.slice(0, 4).join(", ")}
              {technologies.length > 4 ? ` +${technologies.length - 4}` : ""}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-sm bg-secondary">
            <div
              className="h-full rounded-sm bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground md:text-right">
          {daysSinceUpdate === 0
            ? "Updated today"
            : `${daysSinceUpdate}d ago`}
        </p>
      </div>
    </Link>
  )
}

function getStatusClass(status: ProjectStatus): string {
  switch (status) {
    case "active":
      return "text-foreground"
    case "paused":
      return "text-amber-700 dark:text-amber-300"
    case "abandoned":
      return "text-muted-foreground"
    case "completed":
      return "text-emerald-700 dark:text-emerald-300"
  }
}
