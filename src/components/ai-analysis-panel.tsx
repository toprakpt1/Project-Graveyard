"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { analyzeProjectAction } from "@/app/dashboard/settings/ai/actions"

export function AiAnalysisPanel({
  projectId,
  projectName,
  projectContext,
}: {
  projectId: string
  projectName: string
  projectContext: string
}) {
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze() {
    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const result = await analyzeProjectAction(projectId, projectContext)
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-start justify-between gap-4 border-b p-4">
        <div className="flex gap-3">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div>
            <h2 className="font-medium">AI analysis</h2>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              Why did &ldquo;{projectName}&rdquo; stop? Based on the project
              timeline, notes, and GitHub data.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? "Analyzing…" : "Analyze"}
        </Button>
      </div>

      {error && (
        <div className="p-4 text-sm text-destructive">{error}</div>
      )}

      {analysis && (
        <div className="p-4 text-sm leading-relaxed">{analysis}</div>
      )}
    </div>
  )
}