import type { StoppedReason } from "@/types"

export const STOPPED_REASONS: { value: StoppedReason; label: string }[] = [
  { value: "motivation", label: "Lost motivation" },
  { value: "scope_creep", label: "Scope creep" },
  { value: "technical", label: "Technical issue" },
  { value: "no_time", label: "No time" },
  { value: "changed_mind", label: "Changed mind" },
  { value: "other", label: "Other" },
]

export const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  paused: "Paused",
  abandoned: "Abandoned",
  completed: "Completed",
}

export const STATUS_ICONS: Record<string, string> = {
  active: "🟢",
  paused: "🔴",
  abandoned: "⚫",
  completed: "✅",
}
