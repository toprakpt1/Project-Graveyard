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
import { STOPPED_REASONS, STATUS_LABELS } from "@/lib/constants"
import type { Project, ProjectStatus, StoppedReason } from "@/types"

const STATUS_OPTIONS: ProjectStatus[] = ["active", "paused", "abandoned", "completed"]

export function ProjectForm({ project }: { project: Project }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const name = form.get("name") as string
    const description = form.get("description") as string
    const goal = form.get("goal") as string
    const technologies = (form.get("technologies") as string)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    const githubRepoUrl = form.get("github_repo_url") as string
    const status = form.get("status") as ProjectStatus
    const progress = parseInt(form.get("progress") as string) || 0
    const stoppedReason = form.get("stopped_reason") as StoppedReason | ""

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        name,
        description: description || null,
        goal: goal || null,
        technologies,
        github_repo_url: githubRepoUrl || null,
        status,
        progress: Math.min(100, Math.max(0, progress)),
        stopped_reason: stoppedReason || null,
        last_updated_at: new Date().toISOString(),
      })
      .eq("id", project.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push(`/dashboard/${project.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Proje Detayları</CardTitle>
          <CardDescription>Projenin temel bilgileri.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Proje Adı *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={project.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={project.description ?? ""}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Hedef</Label>
            <Textarea
              id="goal"
              name="goal"
              defaultValue={project.goal ?? ""}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technologies">Teknolojiler</Label>
            <Input
              id="technologies"
              name="technologies"
              defaultValue={project.technologies?.join(", ") ?? ""}
              placeholder="React, Supabase, Expo (virgülle ayır)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github_repo_url">GitHub Repo Linki</Label>
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
          <CardTitle>Durum & İlerleme</CardTitle>
          <CardDescription>Projenin şu anki durumu.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Durum</Label>
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
            <Label htmlFor="progress">İlerleme (%)</Label>
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
            <Label htmlFor="stopped_reason">Neden Durdu?</Label>
            <Select
              name="stopped_reason"
              defaultValue={project.stopped_reason ?? ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seç..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Seçilmedi</SelectItem>
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
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          İptal
        </Button>
      </div>
    </form>
  )
}
