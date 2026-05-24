interface Stats {
  total: number
  active: number
  paused: number
  completed: number
  abandoned: number
  avgLifespan: number
  recent: number
}

export function StatsCards({ stats }: { stats: Stats }) {
  const items = [
    { label: "Total", value: stats.total },
    { label: "Active", value: stats.active },
    { label: "Paused", value: stats.paused },
    { label: "Completed", value: stats.completed },
    { label: "Abandoned", value: stats.abandoned },
    { label: "Avg. lifespan", value: `${stats.avgLifespan}d` },
    { label: "Updated 7d", value: stats.recent },
  ]

  return (
    <div className="grid overflow-hidden rounded-lg border bg-card sm:grid-cols-2 lg:grid-cols-7">
      {items.map((item) => (
        <div
          key={item.label}
          className="border-b p-4 last:border-b-0 sm:[&:nth-child(2n)]:border-l lg:border-b-0 lg:border-l lg:first:border-l-0"
        >
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{item.value}</p>
        </div>
      ))}
    </div>
  )
}
