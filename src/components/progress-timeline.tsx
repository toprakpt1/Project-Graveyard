"use client"

import { useMemo, useState } from "react"
import { STATUS_LABELS } from "@/lib/constants"
import type { ProjectStatusEvent } from "@/types"

export function ProgressTimeline({
  events,
}: {
  events: ProjectStatusEvent[]
}) {
  const orderedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) =>
          new Date(a.happened_at).getTime() - new Date(b.happened_at).getTime()
      ),
    [events]
  )
  const [selectedId, setSelectedId] = useState(
    orderedEvents[orderedEvents.length - 1]?.id
  )
  const selectedEvent =
    orderedEvents.find((event) => event.id === selectedId) ??
    orderedEvents[orderedEvents.length - 1]

  if (orderedEvents.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b p-4">
        <h2 className="text-base font-semibold">Progress Timeline</h2>
      </div>

      <div className="overflow-x-auto border-b p-4">
        <div className="flex min-w-max items-start gap-2">
          {orderedEvents.map((event, index) => {
            const selected = event.id === selectedEvent.id

            return (
              <button
                key={event.id}
                type="button"
                onClick={() => setSelectedId(event.id)}
                className={[
                  "grid w-28 gap-2 rounded-md border p-2 text-left transition-colors",
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background hover:bg-muted",
                ].join(" ")}
              >
                <span className="text-xs tabular-nums">
                  {formatShortDate(event.happened_at)}
                </span>
                <span className="text-sm font-medium">
                  {getEventLabel(event)}
                </span>
                <span className="text-xs tabular-nums opacity-75">
                  {event.progress}%
                </span>
                {index < orderedEvents.length - 1 && (
                  <span className="sr-only">Next timeline event</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_160px]">
        <div className="min-w-0">
          <h3 className="text-sm font-medium">{getEventLabel(selectedEvent)}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatLongDate(selectedEvent.happened_at)}
          </p>
          {selectedEvent.note && (
            <p className="mt-3 text-sm leading-5">{selectedEvent.note}</p>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {selectedEvent.from_status
              ? `${STATUS_LABELS[selectedEvent.from_status]} to ${STATUS_LABELS[selectedEvent.to_status]}`
              : STATUS_LABELS[selectedEvent.to_status]}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="tabular-nums">{selectedEvent.progress}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-sm bg-secondary">
            <div
              className="h-full rounded-sm bg-primary"
              style={{ width: `${selectedEvent.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function getEventLabel(event: ProjectStatusEvent): string {
  switch (event.event_type) {
    case "created":
      return "Created"
    case "status_change":
      return "Status changed"
    case "progress_update":
      return "Progress updated"
    case "resurrected":
      return "Resurrected"
    case "archived":
      return "Archived"
    case "restored":
      return "Restored"
  }
}

function formatShortDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function formatLongDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
