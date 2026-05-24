import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Archive,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  GitBranch,
  History,
  RefreshCw,
  Search,
  Skull,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { PublicNav } from "@/components/public-nav"
import { buttonVariants } from "@/components/ui/button"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNav user={null} />

      <main className="flex-1">
        <section className="border-b">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-[1fr_430px] lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-6 flex size-11 items-center justify-center rounded-lg border bg-card">
                <Skull className="size-5" />
              </div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                Project Graveyard
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
                Keep unfinished projects visible, searchable, and easy to
                restart. Save what stopped, what still matters, and the next
                move that would bring it back.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className={buttonVariants({ size: "lg" })}>
                  Start tracking
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  Sign in
                </Link>
              </div>
              <div className="mt-8 grid max-w-xl gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-foreground" />
                  Status history
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-foreground" />
                  Progress notes
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-foreground" />
                  Tech stack tags
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card text-sm">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <p className="font-medium">Backlog review</p>
                  <p className="text-xs text-muted-foreground">4 projects waiting</p>
                </div>
                <Link
                  href="/register"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Add project
                </Link>
              </div>
              <div className="divide-y">
                {[
                  {
                    name: "Invoice parser",
                    reason: "Paused after supplier CSV formats changed",
                    progress: "62%",
                    status: "Revival candidate",
                  },
                  {
                    name: "Portfolio rebuild",
                    reason: "Needs a simpler content model",
                    progress: "35%",
                    status: "Needs decision",
                  },
                  {
                    name: "Workout planner",
                    reason: "API quota issue blocked reminders",
                    progress: "78%",
                    status: "Technical blocker",
                  },
                ].map((project) => (
                  <div key={project.name} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {project.reason}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {project.progress}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="h-1.5 flex-1 rounded bg-muted">
                        <div
                          className="h-full rounded bg-foreground"
                          style={{ width: project.progress }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 divide-x border-t text-center">
                <div className="px-3 py-4">
                  <p className="text-lg font-semibold">12</p>
                  <p className="text-xs text-muted-foreground">Archived</p>
                </div>
                <div className="px-3 py-4">
                  <p className="text-lg font-semibold">5</p>
                  <p className="text-xs text-muted-foreground">Restarted</p>
                </div>
                <div className="px-3 py-4">
                  <p className="text-lg font-semibold">3</p>
                  <p className="text-xs text-muted-foreground">Done</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Put every unfinished project somewhere useful.
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  A project can be abandoned without becoming lost. Keep the
                  context that makes a future restart realistic.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
                {[
                  {
                    icon: Archive,
                    title: "Collect the leftovers",
                    text: "Save the name, description, stack, and the reason work stopped.",
                  },
                  {
                    icon: History,
                    title: "Keep the trail",
                    text: "Add notes as decisions change so old context stays readable.",
                  },
                  {
                    icon: RefreshCw,
                    title: "Restart deliberately",
                    text: "Sort by status and progress before choosing what deserves time.",
                  },
                ].map((feature) => (
                  <div key={feature.title} className="border-t pt-5">
                    <feature.icon className="mb-4 size-5" />
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {feature.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/30 py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 md:px-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-xl font-semibold tracking-tight">
                Built around the way projects actually stall.
              </h2>
              <div className="mt-6 divide-y">
                {[
                  ["Scope changed", "Keep the original goal beside the newer direction."],
                  ["Technical blocker", "Record the issue and the dependency that can unblock it."],
                  ["No time", "Leave a next action small enough to pick up later."],
                ].map(([title, text]) => (
                  <div key={title} className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[150px_1fr]">
                    <p className="font-medium">{title}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-xl font-semibold tracking-tight">
                Review from archive to finished.
              </h2>
              <div className="mt-6 grid gap-4">
                {[
                  {
                    icon: ClipboardList,
                    title: "Log the project",
                    text: "Capture the work before the details fade.",
                  },
                  {
                    icon: Search,
                    title: "Find the strongest restart",
                    text: "Compare progress, blockers, and last activity.",
                  },
                  {
                    icon: GitBranch,
                    title: "Move it forward",
                    text: "Update status as the project returns or closes.",
                  },
                ].map((step) => (
                  <div key={step.title} className="flex gap-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background">
                      <step.icon className="size-4" />
                    </div>
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-4 md:flex-row md:items-center md:px-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Start with the projects already on your mind.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Add one unfinished project, then decide whether it deserves a
                restart, a rewrite, or a clean ending.
              </p>
            </div>
            <Link href="/register" className={buttonVariants({ size: "lg" })}>
              Create account
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <span>Project Graveyard</span>
          <div className="flex items-center gap-4">
            <span>Track unfinished work without losing the thread.</span>
            <a
              href="https://github.com/toprakpt1"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
