export type OpenRouterModel = {
  id: string
  name: string
  free: boolean
}

export const DEFAULT_MODEL = "openrouter/free"

const OPENROUTER_BASE = "https://openrouter.ai/api/v1"

export async function listModels(apiKey: string): Promise<OpenRouterModel[]> {
  const res = await fetch(`${OPENROUTER_BASE}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) throw new Error("Failed to fetch models from OpenRouter")
  const json = await res.json()
  return (json.data ?? []).map((m: { id: string; name: string; pricing?: { per_message?: number } }) => ({
    id: m.id,
    name: m.name,
    free: !m.pricing?.per_message || m.pricing.per_message <= 0,
  }))
}

export async function analyzeProject(
  apiKey: string,
  model: string,
  projectContext: string
): Promise<string> {
  return chatWithProject(apiKey, model, "Why did this project stop?", projectContext)
}

export async function chatWithProject(
  apiKey: string,
  model: string,
  question: string,
  projectContext: string
): Promise<string> {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a project analysis assistant. Answer the user's question about the project based on the provided project data. Be concise (2-3 sentences). Focus on patterns: motivation drop, scope creep, technical blockers, or time constraints.",
        },
        {
          role: "user",
          content: `Project data:\n${projectContext}\n\nQuestion: ${question}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`OpenRouter API error: ${res.status} — ${body}`)
  }
  const json = await res.json()
  return (json.choices?.[0]?.message?.content ?? "").trim()
}