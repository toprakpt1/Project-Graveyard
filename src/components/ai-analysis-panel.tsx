"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { askQuestionAction } from "@/app/dashboard/settings/ai/actions"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export function AiAnalysisPanel({
  projectId,
  projectContext,
}: {
  projectId: string
  projectName: string
  projectContext: string
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const askedRef = useRef(false)

  const ask = useCallback(async (question: string) => {
    setLoading(true)
    setError(null)
    setMessages((prev) => [...prev, { role: "user", content: question }])

    try {
      const result = await askQuestionAction(projectId, question, projectContext)
      setMessages((prev) => [...prev, { role: "assistant", content: result }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [projectId, projectContext])

  useEffect(() => {
    if (askedRef.current) return
    askedRef.current = true
    ask("Why did this project stop?")
  }, [ask])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = input.trim()
    if (!q || loading) return
    setInput("")
    await ask(q)
  }

  return (
    <div className="flex flex-col rounded-lg border bg-card">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">
            Ask a question about this project.
          </p>
        )}

        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === "user" && (
              <p className="text-sm font-medium">{msg.content}</p>
            )}
            {msg.role === "assistant" && (
              <div className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <p className="text-sm italic text-muted-foreground/60">
            Thinking…
          </p>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something about this project…"
            disabled={loading}
            className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <Button type="submit" size="sm" disabled={loading || !input.trim()}>
            Ask
          </Button>
        </form>
      </div>
    </div>
  )
}
