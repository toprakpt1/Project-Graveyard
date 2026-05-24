import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ProjectCard } from "@/components/project-card"
import { StatsCards } from "@/components/stats-cards"
import { STATUS_LABELS } from "@/lib/constants"
import type { Project, ProjectStatus } from "@/types"

export const dynamic = "force-dynamic"

const STATUS_FILTERS: Array<"all" | ProjectStatus> = [
  "all",
  "active",
  "paused",
  "abandoned",
  "completed",
]

type DashboardSearchParams = Promise<{
  status?: string | string[]
}>

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams
}) {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("last_updated_at", { ascending: false })
    .returns<Project[]>()

  const safeProjects = projects ?? []
  const currentTime = new Date().getTime()
  const params = await searchParams
  const requestedStatus = Array.isArray(params.status)
    ? params.status[0]
    : params.status
  const activeFilter = isStatusFilter(requestedStatus) ? requestedStatus : "all"
  const filteredProjects =
    activeFilter === "all"
      ? safeProjects
      : safeProjects.filter((project) => project.status === activeFilter)

  const stats = {
    total: safeProjects.length,
    active: safeProjects.filter((p) => p.status === "active").length,
    paused: safeProjects.filter((p) => p.status === "paused").length,
    completed: safeProjects.filter((p) => p.status === "completed").length,
    abandoned: safeProjects.filter((p) => p.status === "abandoned").length,
    avgLifespan: calculateAvgLifespan(safeProjects),
    recent: safeProjects.filter((p) => daysSince(p.last_updated_at, currentTime) <= 7).length,
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {safeProjects.length === 0
              ? "Track projects you paused, abandoned, finished, or may pick up again."
              : `${safeProjects.length} total projects. ${stats.recent} updated in the last 7 days.`}
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex h-8 w-fit items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New Project
        </Link>
      </div>

      <StatsCards stats={stats} />

      {safeProjects.length === 0 ? (
        <div className="flex min-h-72 flex-col items-start justify-center rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold">No projects yet</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Add the first project with a status, progress, stack, and notes so
            the dashboard has something useful to summarize.
          </p>
          <Link
            href="/dashboard/new"
            className="mt-5 inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            New Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_FILTERS.map((status) => {
                const selected = activeFilter === status
                const count =
                  status === "all"
                    ? safeProjects.length
                    : safeProjects.filter((project) => project.status === status).length

                return (
                  <Link
                    key={status}
                    href={
                      status === "all"
                        ? "/dashboard"
                        : `/dashboard?status=${status}`
                    }
                    className={[
                      "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-sm transition-colors",
                      selected
                        ? "border-foreground/20 bg-foreground text-background"
                        : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                    ].join(" ")}
                  >
                    {status === "all" ? "All" : STATUS_LABELS[status]}
                    <span className="text-xs opacity-70">{count}</span>
                  </Link>
                )
              })}
            </div>

            {filteredProjects.length === 0 ? (
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-base font-semibold">No matching projects</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  This filter is empty. Switch status or add another project.
                </p>
              </div>
            ) : (
              <div className="divide-y rounded-lg border bg-card">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    currentTime={currentTime}
                  />
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-3">
            <DashboardNote
              label="Needs Review"
              value={getNeedsReviewCount(safeProjects, currentTime).toString()}
              detail="Active or paused projects untouched for 30+ days."
            />
            <DashboardNote
              label="Completion Rate"
              value={`${getCompletionRate(stats.completed, stats.total)}%`}
              detail="Completed projects compared with the whole archive."
            />
            <DashboardNote
              label="Oldest Update"
              value={getOldestUpdateLabel(safeProjects, currentTime)}
              detail="Longest time since a project was last touched."
            />
          </aside>
        </div>
      )}
    </div>
  )
}

function DashboardNote({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
        <p className="text-xl font-semibold tabular-nums">{value}</p>
      </div>
      <p className="mt-2 text-sm leading-5 text-muted-foreground">{detail}</p>
    </div>
  )
}

function isStatusFilter(value: string | undefined): value is "all" | ProjectStatus {
  return STATUS_FILTERS.some((status) => status === value)
}

function daysSince(date: string, currentTime: number): number {
  return Math.floor((currentTime - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
}

function getNeedsReviewCount(projects: Project[], currentTime: number): number {
  return projects.filter((project) => {
    const isOpen = project.status === "active" || project.status === "paused"
    return isOpen && daysSince(project.last_updated_at, currentTime) >= 30
  }).length
}

function getCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0

  return Math.round((completed / total) * 100)
}

function getOldestUpdateLabel(projects: Project[], currentTime: number): string {
  if (projects.length === 0) return "0d"

  const oldest = Math.max(
    ...projects.map((project) => daysSince(project.last_updated_at, currentTime))
  )

  return `${oldest}d`
}

function calculateAvgLifespan(projects: Project[]): number {
  const withDates = projects.filter((p) => p.started_at)
  if (withDates.length === 0) return 0

  const totalDays = withDates.reduce((sum, p) => {
    const start = new Date(p.started_at)
    const end = p.last_updated_at ? new Date(p.last_updated_at) : new Date()
    const diff = Math.abs(end.getTime() - start.getTime())
    return sum + Math.ceil(diff / (1000 * 60 * 60 * 24))
  }, 0)

  return Math.round(totalDays / withDates.length)
}
