import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { STATUS_LABELS, STATUS_ICONS } from "@/lib/constants"
import type { Project } from "@/types"

export function ProjectCard({ project }: { project: Project }) {
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(project.last_updated_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <Link href={`/dashboard/${project.id}`}>
      <Card className="h-full transition-colors hover:bg-accent/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="text-base">{project.name}</CardTitle>
              <CardDescription className="line-clamp-2 text-xs">
                {project.description ?? "Açıklama yok"}
              </CardDescription>
            </div>
            <span className="shrink-0 text-sm">
              {STATUS_ICONS[project.status]}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {STATUS_LABELS[project.status]}
            </span>
            <span className="text-muted-foreground">
              %{project.progress}
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {project.technologies?.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            {daysSinceUpdate === 0
              ? "Bugün güncellendi"
              : `${daysSinceUpdate} gün önce güncellendi`}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
