export const SUGGESTED_PROJECT_TAGS = [
  "#idea",
  "#mvp",
  "#tutorial",
  "#client-work",
]

export function parseProjectTags(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(",")
        .map(normalizeProjectTag)
        .filter((tag): tag is string => Boolean(tag))
    )
  )
}

export function normalizeProjectTag(value: string): string | null {
  const tagBody = value
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/\s+/g, "-")

  if (!tagBody) return null

  return `#${tagBody}`
}
