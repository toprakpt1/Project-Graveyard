"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { encryptSecret, decryptSecret } from "@/lib/crypto"
import { analyzeProject, DEFAULT_MODEL, listModels } from "@/lib/openrouter"
import type { AiSettings, Project, ProjectNote, ProjectStatusEvent } from "@/types"

export async function analyzeProjectAction(
  projectId: string,
  projectContext: string
): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { data: aiRaw } = await supabase
    .from("ai_settings")
    .select("openrouter_api_key_ciphertext, model, ai_enabled")
    .eq("user_id", user.id)
    .single()

  const ai = aiRaw as Pick<
    AiSettings,
    "openrouter_api_key_ciphertext" | "model" | "ai_enabled"
  > | null

  if (!ai?.openrouter_api_key_ciphertext || !ai.ai_enabled) {
    throw new Error("AI analysis is not configured. Add an API key in settings.")
  }

  const apiKey = decryptSecret(ai.openrouter_api_key_ciphertext)
  const result = await analyzeProject(apiKey, ai.model, projectContext)

  return result
}

export async function saveAiSettings(formData: FormData) {
  const apiKey = formData.get("api_key")?.toString().trim()
  const model = formData.get("model")?.toString().trim() ?? DEFAULT_MODEL

  if (!apiKey) {
    redirect("/dashboard/settings/ai?message=missing-key")
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    // Validate the key by listing models
    await listModels(apiKey)

    const ciphertext = encryptSecret(apiKey)

    const { error } = await supabase.from("ai_settings").upsert(
      {
        user_id: user.id,
        openrouter_api_key_ciphertext: ciphertext,
        openrouter_api_key_last_four: apiKey.slice(-4),
        model,
        ai_enabled: true,
      },
      { onConflict: "user_id" }
    )

    if (error) throw new Error(error.message)

    revalidatePath("/dashboard/settings/ai")
    redirect("/dashboard/settings/ai?saved=true")
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save"
    redirect(`/dashboard/settings/ai?message=${encodeURIComponent(message)}`)
  }
}

export async function disconnectAi() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  await supabase.from("ai_settings").delete().eq("user_id", user.id)
  revalidatePath("/dashboard/settings/ai")
  redirect("/dashboard/settings/ai")
}