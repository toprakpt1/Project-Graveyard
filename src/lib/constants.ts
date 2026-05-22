import type { StoppedReason } from "@/types"

export const STOPPED_REASONS: { value: StoppedReason; label: string }[] = [
  { value: "motivation", label: "Motivasyon düştü" },
  { value: "scope_creep", label: "Çok büyüdü" },
  { value: "technical", label: "Teknik sorun" },
  { value: "no_time", label: "Zaman yok" },
  { value: "changed_mind", label: "Fikir değişti" },
  { value: "other", label: "Diğer" },
]

export const STATUS_LABELS: Record<string, string> = {
  active: "Aktif",
  paused: "Durdu",
  abandoned: "Terk edildi",
  completed: "Tamamlandı",
}

export const STATUS_ICONS: Record<string, string> = {
  active: "🟢",
  paused: "🔴",
  abandoned: "⚫",
  completed: "✅",
}
