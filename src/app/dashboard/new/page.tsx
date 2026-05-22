"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
    const githubRepoUrl = form.get("github_repo_url") as string

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("Oturum bulunamadı")
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from("projects").insert({
      user_id: user.id,
      name,
      description: description || null,
      goal: goal || null,
      technologies,
      github_repo_url: githubRepoUrl || null,
      status: "active",
      progress: 0,
      started_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString(),
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Yeni Proje</CardTitle>
          <CardDescription>
            Kurtarmak istediğin projeyi tanımla.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Proje Adı *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Dead Link Saver"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Kısa bir açıklama..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Hedef</Label>
              <Textarea
                id="goal"
                name="goal"
                placeholder="Bu projeyle neyi başarmak istiyorsun?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technologies">Teknolojiler</Label>
              <Input
                id="technologies"
                name="technologies"
                placeholder="React, Supabase, Expo (virgülle ayır)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github_repo_url">GitHub Repo Linki</Label>
              <Input
                id="github_repo_url"
                name="github_repo_url"
                type="url"
                placeholder="https://github.com/kullanici/proje"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Oluşturuluyor..." : "Proje Oluştur"}
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
        </CardContent>
      </Card>
    </div>
  )
}
