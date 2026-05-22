"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { ProjectNote } from "@/types"

export function NoteTimeline({
  projectId,
  notes: initialNotes,
}: {
  projectId: string
  notes: ProjectNote[]
}) {
  const [notes, setNotes] = useState(initialNotes)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleAdd = async () => {
    if (!content.trim()) return
    setLoading(true)

    const { data, error } = await supabase
      .from("project_notes")
      .insert({
        project_id: projectId,
        content: content.trim(),
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setNotes((prev) => [data as ProjectNote, ...prev])
    setContent("")
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("project_notes")
      .delete()
      .eq("id", id)

    if (!error) {
      setNotes((prev) => prev.filter((n) => n.id !== id))
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Bugün ne yaptın?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
        <Button onClick={handleAdd} disabled={loading || !content.trim()}>
          {loading ? "Ekleniyor..." : "Not Ekle"}
        </Button>
      </div>

      <Separator />

      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Henüz not eklenmemiş.
        </p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="shrink-0 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Sil
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(note.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
