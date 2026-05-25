import type { ProjectStatus } from "@/types"

const GITHUB_API = "https://api.github.com"
const API_VERSION = "2022-11-28"
const MAX_SYNC_REPOS = 50

export type GithubUser = {
  id: number
  login: string
}

export type GithubRepo = {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  private: boolean
  archived: boolean
  fork: boolean
  language: string | null
  stargazers_count: number
  open_issues_count: number
  default_branch: string
  created_at: string
  pushed_at: string | null
  updated_at: string | null
}

type GithubCommit = {
  sha: string
  commit: {
    author: {
      date: string | null
    } | null
  }
}

export type SyncedGithubRepo = GithubRepo & {
  lastCommitAt: string | null
  lastCommitSha: string | null
}

export async function getGithubUser(token: string): Promise<GithubUser> {
  return githubRequest<GithubUser>("/user", token)
}

export async function listGithubRepos(token: string): Promise<SyncedGithubRepo[]> {
  const repos = await githubRequest<GithubRepo[]>(
    "/user/repos?per_page=100&sort=pushed&affiliation=owner,collaborator,organization_member",
    token
  )

  const ownRepos = repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => getTime(b.pushed_at) - getTime(a.pushed_at))
    .slice(0, MAX_SYNC_REPOS)

  return Promise.all(
    ownRepos.map(async (repo) => {
      const commit = await getLatestCommit(token, repo)

      return {
        ...repo,
        lastCommitAt: commit?.commit.author?.date ?? repo.pushed_at,
        lastCommitSha: commit?.sha ?? null,
      }
    })
  )
}

export function deriveProjectStatus(repo: SyncedGithubRepo, now = Date.now()): ProjectStatus {
  if (repo.archived) return "abandoned"

  const lastActivity = repo.lastCommitAt ?? repo.pushed_at ?? repo.updated_at
  const inactiveDays = lastActivity
    ? Math.floor((now - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
    : 999

  if (inactiveDays >= 60) return "abandoned"
  if (inactiveDays >= 21) return "paused"

  return "active"
}

export function deriveProjectProgress(status: ProjectStatus): number {
  switch (status) {
    case "active":
      return 55
    case "paused":
      return 35
    case "abandoned":
      return 20
    case "completed":
      return 100
  }
}

async function getLatestCommit(
  token: string,
  repo: GithubRepo
): Promise<GithubCommit | null> {
  if (!repo.default_branch) return null

  try {
    const commits = await githubRequest<GithubCommit[]>(
      `/repos/${repo.full_name}/commits?per_page=1&sha=${encodeURIComponent(repo.default_branch)}`,
      token
    )

    return commits[0] ?? null
  } catch {
    return null
  }
}

async function githubRequest<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": API_VERSION,
    },
  })

  if (!response.ok) {
    const message = await getGithubErrorMessage(response)
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

async function getGithubErrorMessage(response: Response): Promise<string> {
  if (response.status === 401) {
    return "GitHub token is invalid or expired."
  }

  if (response.status === 403) {
    const acceptedPermissions = response.headers.get("x-accepted-github-permissions")

    if (acceptedPermissions) {
      return `GitHub token is missing permissions: ${acceptedPermissions}.`
    }

    return "GitHub denied the request. Check token permissions or rate limits."
  }

  try {
    const body = (await response.json()) as { message?: string }
    return body.message ?? `GitHub request failed with ${response.status}.`
  } catch {
    return `GitHub request failed with ${response.status}.`
  }
}

function getTime(value: string | null): number {
  return value ? new Date(value).getTime() : 0
}
