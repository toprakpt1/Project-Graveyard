import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProjectForm } from "@/components/project-form"

export const dynamic = "force-dynamic"

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single()

  if (!project) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Project</h1>
      <ProjectForm project={project} />
    </div>
  )
}
