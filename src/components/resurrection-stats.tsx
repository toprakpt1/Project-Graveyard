import Link from "next/link"
import { STATUS_LABELS } from "@/lib/constants"
import type { Project } from "@/types"

export function ResurrectionStats({ projects }: { projects: Project[] }) {
  const resurrectedProjects = projects
    .filter((project) => project.restarted_at)
    .sort(
      (a, b) =>
        new Date(b.restarted_at!).getTime() - new Date(a.restarted_at!).getTime()
    )
  const successfulResurrections = resurrectedProjects.filter(
    (project) => project.status === "completed"
  ).length
  const activeResurrections = resurrectedProjects.filter(
    (project) => project.status === "active"
  ).length
  const successRate =
    resurrectedProjects.length === 0
      ? 0
      : Math.round((successfulResurrections / resurrectedProjects.length) * 100)

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b p-4">
        <h2 className="text-base font-semibold">Resurrection Statistics</h2>
      </div>
      <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Stat label="Revived" value={resurrectedProjects.length.toString()} />
        <Stat label="Success rate" value={`${successRate}%`} />
        <Stat label="Alive now" value={activeResurrections.toString()} />
      </div>

      {resurrectedProjects.length > 0 && (
        <div className="divide-y border-t">
          {resurrectedProjects.slice(0, 4).map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/${project.id}`}
              className="grid gap-2 p-4 transition-colors hover:bg-muted/50 sm:grid-cols-[minmax(0,1fr)_140px_96px]"
            >
              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium">{project.name}</h3>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  graveyard to {project.status === "active" ? "alive" : project.status}
                </p>
              </div>
              <p className="text-sm text-muted-foreground sm:text-right">
                {formatDate(project.restarted_at)}
              </p>
              <p className="text-sm sm:text-right">
                {STATUS_LABELS[project.status]}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function formatDate(value: string | null): string {
  if (!value) return "Unknown"

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
