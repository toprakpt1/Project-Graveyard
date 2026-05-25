export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export type ProjectStatus = "active" | "paused" | "abandoned" | "completed"

export type StoppedReason =
  | "motivation"
  | "scope_creep"
  | "technical"
  | "no_time"
  | "changed_mind"
  | "other"

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  goal: string | null
  technologies: string[]
  tags: string[]
  github_repo_url: string | null
  status: ProjectStatus
  progress: number
  stopped_reason: StoppedReason | null
  started_at: string
  last_updated_at: string
  created_at: string
  updated_at: string
  archived_at: string | null
  restarted_at: string | null
  pinned: boolean
  pinned_at: string | null
  github_repo_id: number | null
  github_full_name: string | null
  github_default_branch: string | null
  github_private: boolean
  github_last_pushed_at: string | null
  github_last_commit_at: string | null
  github_last_commit_sha: string | null
  github_language: string | null
  github_stars: number
  github_open_issues: number
}

export interface ProjectNote {
  id: string
  project_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface GithubConnection {
  id: string
  user_id: string
  github_login: string
  github_user_id: number
  token_ciphertext: string
  token_last_four: string
  token_type: "fine_grained_pat"
  repo_count: number
  last_synced_at: string | null
  created_at: string
  updated_at: string
}
