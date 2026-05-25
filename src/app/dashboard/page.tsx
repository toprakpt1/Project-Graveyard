import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ActivityHeatmap } from "@/components/activity-heatmap"
import { ProjectCard } from "@/components/project-card"
import { ResurrectionStats } from "@/components/resurrection-stats"
import { StatsCards } from "@/components/stats-cards"
import { STATUS_LABELS } from "@/lib/constants"
import type { Project, ProjectStatus } from "@/types"

export const dynamic = "force-dynamic"

type StatusFilterOption = "all" | "archived" | ProjectStatus

const STATUS_FILTERS: StatusFilterOption[] = [
  "all",
  "active",
  "paused",
  "abandoned",
  "completed",
  "archived",
]

type DashboardSearchParams = Promise<{
  status?: string | string[]
  tag?: string | string[]
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
    .order("pinned_at", { ascending: false, nullsFirst: false })
    .order("last_updated_at", { ascending: false })
    .returns<Project[]>()
  const { data: activityNotes } = await supabase
    .from("project_notes")
    .select("created_at")
    .order("created_at", { ascending: false })
    .limit(500)

  const safeProjects = projects ?? []
  const currentTime = new Date().getTime()
  const params = await searchParams
  const requestedStatus = Array.isArray(params.status)
    ? params.status[0]
    : params.status
  const requestedTag = Array.isArray(params.tag) ? params.tag[0] : params.tag
  const activeFilter = isStatusFilter(requestedStatus) ? requestedStatus : "all"
  const tagOptions = getTagOptions(safeProjects)
  const activeTag = tagOptions.includes(requestedTag ?? "") ? requestedTag : undefined
  const filteredProjects = safeProjects.filter((project) => {
    const isArchived = project.archived_at !== null

    if (activeFilter === "archived") return isArchived
    if (isArchived) return false

    const matchesStatus =
      activeFilter === "all" || project.status === activeFilter
    const matchesTag = !activeTag || (project.tags ?? []).includes(activeTag)

    return matchesStatus && matchesTag
  })

  const activeProjects = safeProjects.filter((p) => !p.archived_at)
  const archivedCount = safeProjects.filter((p) => p.archived_at).length

  const stats = {
    total: activeProjects.length,
    active: activeProjects.filter((p) => p.status === "active").length,
    paused: activeProjects.filter((p) => p.status === "paused").length,
    completed: activeProjects.filter((p) => p.status === "completed").length,
    abandoned: activeProjects.filter((p) => p.status === "abandoned").length,
    avgLifespan: calculateAvgLifespan(activeProjects),
    recent: activeProjects.filter((p) => daysSince(p.last_updated_at, currentTime) <= 7).length,
    archived: archivedCount,
  }
  const activityDates = [
    ...safeProjects.flatMap((project) =>
      [
        project.created_at,
        project.last_updated_at,
        project.restarted_at,
        project.archived_at,
      ].filter(Boolean)
    ),
    ...((activityNotes as { created_at: string }[] | null) ?? []).map(
      (note) => note.created_at
    ),
  ] as string[]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {safeProjects.length === 0
              ? "Track projects you paused, abandoned, finished, or may pick up again."
              : `${stats.total} active projects. ${stats.recent} updated in the last 7 days.`}
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <ActivityHeatmap activityDates={activityDates} />
        <ResurrectionStats projects={safeProjects} />
      </div>

      {activeProjects.length === 0 && archivedCount === 0 ? (
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
      ) : activeProjects.length === 0 && archivedCount > 0 && activeFilter !== "archived" ? (
        <div className="flex min-h-72 flex-col items-start justify-center rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold">All projects archived</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            All your projects are archived. Switch to the{" "}
            <Link
              href="/dashboard?status=archived"
              className="underline underline-offset-4 hover:text-foreground"
            >
              archived view
            </Link>{" "}
            to see them.
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
                    ? safeProjects.filter((p) => !p.archived_at).length
                    : status === "archived"
                      ? safeProjects.filter((p) => p.archived_at).length
                      : safeProjects.filter((p) => !p.archived_at && p.status === status).length

                return (
                  <Link
                    key={status}
                    href={getDashboardHref(status, activeTag)}
                    className={[
                      "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-sm transition-colors",
                      selected
                        ? "border-foreground/20 bg-foreground text-background"
                        : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                    ].join(" ")}
                  >
                    {status === "all" ? "All" : status === "archived" ? "Archived" : STATUS_LABELS[status]}
                    <span className="text-xs opacity-70">{count}</span>
                  </Link>
                )
              })}
            </div>

            {tagOptions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={getDashboardHref(activeFilter)}
                  className={[
                    "inline-flex h-8 items-center rounded-md border px-3 text-sm transition-colors",
                    !activeTag
                      ? "border-foreground/20 bg-foreground text-background"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  All tags
                </Link>
                {tagOptions.map((tag) => {
                  const selected = activeTag === tag
                  const count = safeProjects.filter((project) =>
                    (project.tags ?? []).includes(tag)
                  ).length

                  return (
                    <Link
                      key={tag}
                      href={getDashboardHref(activeFilter, tag)}
                      className={[
                        "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-sm transition-colors",
                        selected
                          ? "border-foreground/20 bg-foreground text-background"
                          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                      ].join(" ")}
                    >
                      {tag}
                      <span className="text-xs opacity-70">{count}</span>
                    </Link>
                  )
                })}
              </div>
            )}

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
            <DashboardNote
              label="Top Technology"
              value={getTopTechnologyLabel(safeProjects)}
              detail="Most common stack entry across saved and synced projects."
            />
            <DashboardNote
              label="Top Tag"
              value={getTopTagLabel(safeProjects)}
              detail="Most common category tag outside the tech stack."
            />
            <DashboardNote
              label="Archived"
              value={stats.archived.toString()}
              detail="Projects moved to the archive. Change filter to view."
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

function isStatusFilter(value: string | undefined): value is StatusFilterOption {
  return STATUS_FILTERS.some((status) => status === value)
}

function getDashboardHref(status: StatusFilterOption, tag?: string): string {
  const params = new URLSearchParams()

  if (status !== "all") {
    params.set("status", status)
  }

  if (tag) {
    params.set("tag", tag)
  }

  const query = params.toString()
  return query ? `/dashboard?${query}` : "/dashboard"
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

function getTopTechnologyLabel(projects: Project[]): string {
  const counts = new Map<string, number>()

  for (const project of projects) {
    for (const technology of project.technologies ?? []) {
      counts.set(technology, (counts.get(technology) ?? 0) + 1)
    }
  }

  const [topTechnology] = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0] ?? []

  return topTechnology ?? "None"
}

function getTagOptions(projects: Project[]): string[] {
  return Array.from(
    new Set(projects.flatMap((project) => project.tags ?? []))
  ).sort((a, b) => a.localeCompare(b))
}

function getTopTagLabel(projects: Project[]): string {
  const counts = new Map<string, number>()

  for (const project of projects) {
    for (const tag of project.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  const [topTag] = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0] ?? []

  return topTag ?? "None"
}
