"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { decryptSecret, encryptSecret } from "@/lib/crypto"
import {
  deriveProjectProgress,
  deriveProjectStatus,
  getGithubUser,
  listGithubRepos,
  type SyncedGithubRepo,
} from "@/lib/github"
import type { Project, ProjectStatus } from "@/types"

type ExistingGithubProject = Pick<
  Project,
  "id" | "github_repo_id" | "technologies" | "status" | "progress"
>

export async function saveGithubToken(formData: FormData) {
  const token = formData.get("github_token")?.toString().trim()
  let target = "/dashboard/settings?github=missing-token"

  if (!token) {
    redirect(target)
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    const githubUser = await getGithubUser(token)
    const tokenCiphertext = encryptSecret(token)
    const { created, updated, total } = await syncGithubProjects(user.id, token)
    const { error } = await supabase.from("github_connections").upsert(
      {
        user_id: user.id,
        github_login: githubUser.login,
        github_user_id: githubUser.id,
        token_ciphertext: tokenCiphertext,
        token_last_four: token.slice(-4),
        token_type: "fine_grained_pat",
        repo_count: total,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/settings")
    target = `/dashboard/settings?github=saved&created=${created}&updated=${updated}`
  } catch (error) {
    target = `/dashboard/settings?github=error&message=${encodeURIComponent(getMessage(error))}`
  }

  redirect(target)
}

export async function syncGithubRepos() {
  let target = "/dashboard/settings?github=not-connected"

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    const { data: connection, error } = await supabase
      .from("github_connections")
      .select("token_ciphertext")
      .eq("user_id", user.id)
      .single()

    if (error || !connection) {
      throw new Error("Save a GitHub token before syncing repositories.")
    }

    const token = decryptSecret(connection.token_ciphertext)
    const { created, updated, total } = await syncGithubProjects(user.id, token)

    const { error: updateError } = await supabase
      .from("github_connections")
      .update({
        repo_count: total,
        last_synced_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/settings")
    target = `/dashboard/settings?github=synced&created=${created}&updated=${updated}`
  } catch (error) {
    target = `/dashboard/settings?github=error&message=${encodeURIComponent(getMessage(error))}`
  }

  redirect(target)
}

export async function disconnectGithub() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  await supabase.from("github_connections").delete().eq("user_id", user.id)
  revalidatePath("/dashboard/settings")
  redirect("/dashboard/settings?github=disconnected")
}

async function syncGithubProjects(userId: string, token: string) {
  const supabase = await createClient()
  const repos = await listGithubRepos(token)
  const { data: existingRaw, error } = await supabase
    .from("projects")
    .select("id, github_repo_id, technologies, status, progress")
    .eq("user_id", userId)
    .not("github_repo_id", "is", null)

  if (error) {
    throw new Error(error.message)
  }

  const existingProjects = (existingRaw ?? []) as ExistingGithubProject[]
  const existingByRepoId = new Map(
    existingProjects.map((project) => [project.github_repo_id, project])
  )
  let created = 0
  let updated = 0

  for (const repo of repos) {
    const existing = existingByRepoId.get(repo.id)
    const status = deriveProjectStatus(repo)

    if (existing) {
      await updateExistingProject(userId, repo, existing, status)
      updated += 1
    } else {
      await insertGithubProject(userId, repo, status)
      created += 1
    }
  }

  return { created, updated, total: repos.length }
}

async function updateExistingProject(
  userId: string,
  repo: SyncedGithubRepo,
  existing: ExistingGithubProject,
  derivedStatus: ProjectStatus
) {
  const supabase = await createClient()
  const nextStatus = existing.status === "completed" ? existing.status : derivedStatus
  const { error } = await supabase
    .from("projects")
    .update({
      github_repo_url: repo.html_url,
      github_full_name: repo.full_name,
      github_default_branch: repo.default_branch,
      github_private: repo.private,
      github_last_pushed_at: repo.pushed_at,
      github_last_commit_at: repo.lastCommitAt,
      github_last_commit_sha: repo.lastCommitSha,
      github_language: repo.language,
      github_stars: repo.stargazers_count,
      github_open_issues: repo.open_issues_count,
      technologies: mergeTechnologies(existing.technologies, repo.language),
      status: nextStatus,
      last_updated_at: repo.lastCommitAt ?? repo.pushed_at ?? repo.updated_at,
    })
    .eq("user_id", userId)
    .eq("id", existing.id)

  if (error) {
    throw new Error(error.message)
  }
}

async function insertGithubProject(
  userId: string,
  repo: SyncedGithubRepo,
  status: ProjectStatus
) {
  const supabase = await createClient()
  const activityDate = repo.lastCommitAt ?? repo.pushed_at ?? repo.updated_at
  const { error } = await supabase.from("projects").insert({
    user_id: userId,
    name: repo.name,
    description: repo.description,
    goal: null,
    technologies: mergeTechnologies([], repo.language),
    github_repo_url: repo.html_url,
    github_repo_id: repo.id,
    github_full_name: repo.full_name,
    github_default_branch: repo.default_branch,
    github_private: repo.private,
    github_last_pushed_at: repo.pushed_at,
    github_last_commit_at: repo.lastCommitAt,
    github_last_commit_sha: repo.lastCommitSha,
    github_language: repo.language,
    github_stars: repo.stargazers_count,
    github_open_issues: repo.open_issues_count,
    status,
    progress: deriveProjectProgress(status),
    stopped_reason: status === "active" ? null : "other",
    started_at: repo.created_at,
    last_updated_at: activityDate ?? repo.created_at,
  })

  if (error) {
    throw new Error(error.message)
  }
}

function mergeTechnologies(current: string[] | null, language: string | null): string[] {
  return Array.from(new Set([...(current ?? []), language].filter(Boolean) as string[]))
}

function getMessage(error: unknown): string {
  return error instanceof Error
    ? "An unexpected error occurred. Please try again."
    : "Something went wrong."
}
