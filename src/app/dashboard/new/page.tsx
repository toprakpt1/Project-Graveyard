"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { parseProjectTags, SUGGESTED_PROJECT_TAGS } from "@/lib/tags"

export default function NewProjectPage() {
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
    const tags = parseProjectTags(form.get("tags") as string)
    const githubRepoUrl = form.get("github_repo_url") as string

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("Session not found")
      setLoading(false)
      return
    }

    const now = new Date().toISOString()
    const { data: createdProject, error: insertError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        goal: goal || null,
        technologies,
        tags,
        github_repo_url: githubRepoUrl || null,
        status: "active",
        progress: 0,
        started_at: now,
        last_updated_at: now,
      })
      .select("id")
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    if (createdProject) {
      await supabase.from("project_status_events").insert({
        project_id: createdProject.id,
        event_type: "created",
        from_status: null,
        to_status: "active",
        progress: 0,
        note: "Project was created.",
        happened_at: now,
      })
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>New Project</CardTitle>
          <CardDescription>
            Define the project you want to resurrect.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Dead Link Saver"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="A short description..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Goal</Label>
              <Textarea
                id="goal"
                name="goal"
                placeholder="What do you want to achieve with this project?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technologies">Technologies</Label>
              <Input
                id="technologies"
                name="technologies"
                placeholder="React, Supabase, Expo (comma-separated)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
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
                placeholder="https://github.com/user/repo"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Project"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
