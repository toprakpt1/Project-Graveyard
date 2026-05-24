import { redirect } from "next/navigation"
import Link from "next/link"
import { Skull, Archive, RefreshCw, Trophy, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { PublicNav } from "@/components/public-nav"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav user={null} />

      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="mx-auto max-w-5xl px-4 text-center md:px-6">
            <div className="mb-6 flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                <Skull className="size-8 text-primary" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-6xl">
              Project Graveyard
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Collect your unfinished projects, track them, and resurrect them
              from the ashes when needed.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/register" className={buttonVariants({ size: "lg" })}>
                Get Started
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Sign In
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="mb-2 text-3xl font-bold">Why Project Graveyard?</h2>
              <p className="text-muted-foreground">
                The easiest way to organize your unfinished projects
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <Archive className="mb-2 size-8 text-primary" />
                  <CardTitle>Collect Projects</CardTitle>
                  <CardDescription>
                    View and categorize all your unfinished projects in one
                    place.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <RefreshCw className="mb-2 size-8 text-primary" />
                  <CardTitle>Resurrect</CardTitle>
                  <CardDescription>
                    Add notes, track progress, and take steps to revive your
                    projects.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Trophy className="mb-2 size-8 text-primary" />
                  <CardTitle>Complete & Celebrate</CardTitle>
                  <CardDescription>
                    Mark projects as completed and enjoy your finished work.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 text-sm text-muted-foreground md:px-6">
          <span>Project Graveyard</span>
          <div className="flex items-center gap-4">
            <span>The graveyard for unfinished projects</span>
            <a
              href="https://github.com/toprakpt1"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span className="sr-only">GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
