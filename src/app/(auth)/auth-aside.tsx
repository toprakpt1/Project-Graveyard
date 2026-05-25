import Link from "next/link"
import { Archive, CheckCircle2, GitBranch, Skull } from "lucide-react"

type AuthAsideProps = {
  title: string
  description: string
  checklist: string[]
  footer: string
}

const previewProjects = [
  ["Invoice parser", "62%", "Blocked"],
  ["Portfolio rebuild", "35%", "Needs decision"],
  ["Workout planner", "78%", "API issue"],
]

export function AuthAside({
  title,
  description,
  checklist,
  footer,
}: AuthAsideProps) {
  return (
    <section className="relative hidden overflow-hidden border-r bg-muted lg:flex lg:flex-col lg:justify-between lg:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:44px_44px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-10 top-28 w-[360px] rounded-lg border bg-background/70 text-sm"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2 font-medium">
            <Archive className="size-4" />
            Project archive
          </div>
          <span className="text-muted-foreground">3 waiting</span>
        </div>
        <div className="divide-y">
          {previewProjects.map(([name, progress, status]) => (
            <div key={name} className="grid grid-cols-[1fr_48px] gap-3 px-4 py-3">
              <div>
                <p className="font-medium">{name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{status}</p>
              </div>
              <p className="text-right text-muted-foreground">{progress}</p>
            </div>
          ))}
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-24 right-24 w-[280px] rounded-lg border bg-background/60 p-4 text-sm"
      >
        <div className="flex items-center gap-2 font-medium">
          <GitBranch className="size-4" />
          Next restart
        </div>
        <div className="mt-4 space-y-3 text-muted-foreground">
          <div className="h-2 w-11/12 rounded-sm bg-foreground/20" />
          <div className="h-2 w-8/12 rounded-sm bg-foreground/15" />
          <div className="h-2 w-10/12 rounded-sm bg-foreground/15" />
        </div>
      </div>

      <Link href="/" className="relative z-10 flex w-fit items-center gap-2 text-sm font-medium">
        <div className="flex size-8 items-center justify-center rounded-lg border bg-background">
          <Skull className="size-4" />
        </div>
        Project Graveyard
      </Link>

      <div className="relative z-10 max-w-lg">
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
          {description}
        </p>
        <div className="mt-8 grid gap-4 text-sm">
          {checklist.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle2 className="size-4" />
              <span className="text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="relative z-10 text-sm text-muted-foreground">{footer}</p>
    </section>
  )
}
