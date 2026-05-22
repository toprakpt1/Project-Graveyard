import { createClient } from "@/lib/supabase/server"
import { ProjectCard } from "@/components/project-card"
import { StatsCards } from "@/components/stats-cards"
import type { Project } from "@/types"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("last_updated_at", { ascending: false })
    .returns<Project[]>()

  const safeProjects = projects ?? []

  const stats = {
    total: safeProjects.length,
    completed: safeProjects.filter((p) => p.status === "completed").length,
    abandoned: safeProjects.filter((p) => p.status !== "completed").length,
    avgLifespan: calculateAvgLifespan(safeProjects),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Projelerin</h1>
        <p className="text-muted-foreground">
          {safeProjects.length === 0
            ? "Henüz proje eklemedin. Yeni bir proje ekleyerek başla!"
            : `${safeProjects.length} proje — ${stats.completed} tamamlanmış, ${stats.abandoned} yarıda kalmış`}
        </p>
      </div>

      <StatsCards stats={stats} />

      {safeProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-4xl mb-4">🪦</p>
          <h2 className="text-xl font-semibold mb-2">Henüz proje yok</h2>
          <p className="text-muted-foreground mb-6">
            İlk projeni ekleyerek mezarlığı büyütmeye başla!
          </p>
          <a
            href="/dashboard/new"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            + Yeni Proje
          </a>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {safeProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
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
