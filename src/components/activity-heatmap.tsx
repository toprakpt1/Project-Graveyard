type HeatmapDay = {
  date: string
  count: number
}

const DAY_MS = 1000 * 60 * 60 * 24
const WEEK_COUNT = 16

export function ActivityHeatmap({
  activityDates,
  title = "Activity Heatmap",
}: {
  activityDates: string[]
  title?: string
}) {
  const days = buildHeatmapDays(activityDates)
  const totalActivity = days.reduce((sum, day) => sum + day.count, 0)

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex flex-col gap-1 border-b p-4 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground tabular-nums">
          {totalActivity} updates in {WEEK_COUNT} weeks
        </p>
      </div>
      <div className="p-4">
        <div className="grid grid-flow-col grid-rows-7 gap-1">
          {days.map((day) => (
            <div
              key={day.date}
              title={`${formatDate(day.date)}: ${day.count} update${day.count === 1 ? "" : "s"}`}
              aria-label={`${formatDate(day.date)}: ${day.count} update${day.count === 1 ? "" : "s"}`}
              className={[
                "aspect-square rounded-[2px] border border-foreground/5",
                getHeatmapClass(day.count),
              ].join(" ")}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 4, 6].map((count) => (
            <span
              key={count}
              className={[
                "size-3 rounded-[2px] border border-foreground/5",
                getHeatmapClass(count),
              ].join(" ")}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}

function buildHeatmapDays(activityDates: string[]): HeatmapDay[] {
  const counts = new Map<string, number>()

  for (const value of activityDates) {
    const date = toDateKey(value)
    counts.set(date, (counts.get(date) ?? 0) + 1)
  }

  const today = new Date()
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const start = new Date(end.getTime() - (WEEK_COUNT * 7 - 1) * DAY_MS)

  return Array.from({ length: WEEK_COUNT * 7 }, (_, index) => {
    const date = new Date(start.getTime() + index * DAY_MS)
    const key = toDateKey(date.toISOString())

    return {
      date: key,
      count: counts.get(key) ?? 0,
    }
  })
}

function toDateKey(value: string): string {
  return new Date(value).toISOString().slice(0, 10)
}

function getHeatmapClass(count: number): string {
  if (count === 0) return "bg-muted"
  if (count === 1) return "bg-foreground/20"
  if (count <= 3) return "bg-foreground/40"
  if (count <= 5) return "bg-foreground/60"
  return "bg-foreground/80"
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
