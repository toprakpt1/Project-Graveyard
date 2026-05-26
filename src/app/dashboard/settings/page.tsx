import { Bot, GitBranch, RefreshCw, Trash2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  disconnectGithub,
  saveGithubToken,
  syncGithubRepos,
} from "./actions"
import type { GithubConnection } from "@/types"

export const dynamic = "force-dynamic"

type SettingsSearchParams = Promise<{
  github?: string | string[]
  message?: string | string[]
  created?: string | string[]
  updated?: string | string[]
}>

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: SettingsSearchParams
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const params = await searchParams
  const status = getParam(params.github)
  const message = getStatusMessage({
    status,
    message: getParam(params.message),
    created: getParam(params.created),
    updated: getParam(params.updated),
  })

  const { data } = user
    ? await supabase
        .from("github_connections")
        .select(
          "id, user_id, github_login, github_user_id, token_last_four, token_type, repo_count, last_synced_at, created_at, updated_at"
        )
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null }

  const connection = data as Omit<GithubConnection, "token_ciphertext"> | null

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="border-b pb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect a GitHub token and keep your archive updated from repository activity.
        </p>
      </div>

      {message && (
        <div
          className={[
            "rounded-lg border px-4 py-3 text-sm",
            message.tone === "error"
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "bg-card text-foreground",
          ].join(" ")}
          role="status"
        >
          {message.text}
        </div>
      )}

      <section className="rounded-lg border bg-card">
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div className="flex gap-3">
            <GitBranch className="mt-0.5 size-5" />
            <div>
              <h2 className="font-medium">GitHub token</h2>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Use a fine-grained personal access token. Project Graveyard reads
                repositories and recent commits; it does not write to GitHub.
              </p>
            </div>
          </div>
          {connection && (
            <div className="shrink-0 text-right text-sm">
              <p className="font-medium">@{connection.github_login}</p>
              <p className="text-muted-foreground">ends with {connection.token_last_four}</p>
            </div>
          )}
        </div>

        <div className="grid gap-6 p-4 md:grid-cols-[1fr_220px]">
          <form action={saveGithubToken} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github_token">Personal access token</Label>
              <Input
                id="github_token"
                name="github_token"
                type="password"
                placeholder="github_pat_..."
                autoComplete="off"
                required
              />
            </div>
            <Button type="submit">
              {connection ? "Replace token and sync" : "Save token and sync"}
            </Button>
          </form>

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium">Required permissions</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>Repository access: selected repositories or all repositories</li>
                <li>Metadata: read</li>
                <li>Contents: read</li>
                <li>Account permissions: none</li>
              </ul>
            </div>
          </div>
        </div>

        {connection && (
          <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              <p>{connection.repo_count} repositories available to the token.</p>
              <p>Last sync: {formatDate(connection.last_synced_at)}</p>
            </div>
            <div className="flex gap-2">
              <form action={syncGithubRepos}>
                <Button type="submit" variant="outline">
                  <RefreshCw className="size-4" />
                  Sync
                </Button>
              </form>
              <form action={disconnectGithub}>
                <Button type="submit" variant="outline">
                  <Trash2 className="size-4" />
                  Disconnect
                </Button>
              </form>
            </div>
          </div>
        )}
      </section>

      <Link
        href="/dashboard/settings/ai"
        className="rounded-lg border bg-card p-4 flex items-center gap-3 hover:bg-muted transition-colors"
      >
        <Bot className="size-5" />
        <div>
          <h2 className="font-medium">AI settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure an OpenRouter API key for project analysis.
          </p>
        </div>
        <span className="ml-auto text-sm text-muted-foreground">&rarr;</span>
      </Link>
    </div>
  )
}

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function getStatusMessage({
  status,
  message,
  created,
  updated,
}: {
  status?: string
  message?: string
  created?: string
  updated?: string
}) {
  switch (status) {
    case "saved":
      return {
        tone: "success" as const,
        text: `GitHub token saved. Created ${created ?? "0"} projects and updated ${updated ?? "0"}.`,
      }
    case "synced":
      return {
        tone: "success" as const,
        text: `GitHub sync complete. Created ${created ?? "0"} projects and updated ${updated ?? "0"}.`,
      }
    case "disconnected":
      return { tone: "success" as const, text: "GitHub token disconnected." }
    case "missing-token":
      return { tone: "error" as const, text: "Enter a GitHub token first." }
    case "not-connected":
      return { tone: "error" as const, text: "Save a GitHub token before syncing." }
    case "error":
      return {
        tone: "error" as const,
        text: message ?? "GitHub action failed.",
      }
    default:
      return null
  }
}

function formatDate(value: string | null): string {
  if (!value) return "Never"

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
