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
  github_repo_url: string | null
  status: ProjectStatus
  progress: number
  stopped_reason: StoppedReason | null
  started_at: string
  last_updated_at: string
  created_at: string
  updated_at: string
}

export interface ProjectNote {
  id: string
  project_id: string
  content: string
  created_at: string
  updated_at: string
}
