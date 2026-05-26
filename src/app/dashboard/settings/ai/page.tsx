import { Bot } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { saveAiSettings, disconnectAi } from "./actions"
import { DEFAULT_MODEL } from "@/lib/openrouter"
import type { AiSettings } from "@/types"

export const dynamic = "force-dynamic"

type SearchParams = Promise<{
  saved?: string
  message?: string
}>

export default async function AiSettingsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams
  const savedParams = Array.isArray(params) ? null : params

  const { data: raw } = user
    ? await supabase
        .from("ai_settings")
        .select("id, model, ai_enabled, openrouter_api_key_last_four")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null }

  const settings = raw as Pick<
    AiSettings,
    "id" | "model" | "ai_enabled" | "openrouter_api_key_last_four"
  > | null

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="border-b pb-5">
        <h1 className="text-2xl font-semibold tracking-tight">AI Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect an OpenRouter API key to enable project analysis and insights.
        </p>
      </div>

      <section className="rounded-lg border bg-card">
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div className="flex gap-3">
            <Bot className="mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="font-medium">OpenRouter API key</h2>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Used for AI project analysis — why projects stop, what to do
                next, and activity pattern recognition.
              </p>
            </div>
          </div>
          {settings?.openrouter_api_key_last_four && (
            <div className="shrink-0 text-right text-sm">
              <p className="font-medium">ends with {settings.openrouter_api_key_last_four}</p>
            </div>
          )}
        </div>

        <div className="grid gap-6 p-4">
          <form action={saveAiSettings} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api_key">OpenRouter API key</Label>
              <Input
                id="api_key"
                name="api_key"
                type="password"
                placeholder="sk-or-v1-..."
                autoComplete="off"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="model">Model</Label>
              <input type="hidden" name="model" value={settings?.model ?? DEFAULT_MODEL} />
              <Select
                id="model"
                name="model"
                defaultValue={settings?.model ?? DEFAULT_MODEL}
              >
                <option value={DEFAULT_MODEL}>Auto (free — routes to available free models)</option>
                <option value="google/gemini-2.0-flash-001">Gemini 2.0 Flash</option>
                <option value="gryphe/mythomax-l2-13b">MythoMax L2 13B</option>
                <option value="openai/gpt-4o-mini">GPT-4o-mini</option>
                <option value="openai/gpt-4o">GPT-4o</option>
              </Select>
            </div>
            <Button type="submit">
              {settings?.openrouter_api_key_last_four
                ? "Replace key and save"
                : "Save API key"}
            </Button>
          </form>
        </div>

        {settings?.openrouter_api_key_last_four && (
          <div className="flex items-center justify-between border-t p-4">
            <div className="text-sm text-muted-foreground">
              <p>Model: {settings.model}</p>
              <p>AI analysis is {settings.ai_enabled ? "enabled" : "disabled"}</p>
            </div>
            <form action={disconnectAi}>
              <Button type="submit" variant="outline">
                Disconnect
              </Button>
            </form>
          </div>
        )}
      </section>
    </div>
  )
}