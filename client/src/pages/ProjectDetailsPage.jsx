import { ArrowLeft, Edit3 } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import { getProjectById, updateProject } from "@/api/projects"
import { getTeamMembers } from "@/api/users"
import PageHeader from "@/components/common/PageHeader"
import ProjectFormDialog from "@/components/forms/ProjectFormDialog"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/useAuth"

const ProjectDetailsPage = () => {
  const { projectId } = useParams()
  const { isAdmin } = useAuth()
  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchProject = async () => {
    setIsLoading(true)
    try {
      const [projectData, memberData] = await Promise.all([getProjectById(projectId), getTeamMembers()])
      setProject(projectData)
      setMembers(memberData)
    } catch (_error) {
      toast.error("Unable to load the project workspace")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const handleUpdate = async (values) => {
    setIsSubmitting(true)
    try {
      await updateProject(projectId, values)
      toast.success("Project updated")
      setOpen(false)
      fetchProject()
    } catch (_error) {
      toast.error("Unable to update project")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <Skeleton className="h-[520px] w-full" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="secondary" asChild>
          <Link to="/app/projects">
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Link>
        </Button>
      </div>

      <PageHeader
        eyebrow="Project workspace"
        title={project.title}
        description={project.description}
        actionLabel={isAdmin ? "Edit project" : undefined}
        actionIcon={Edit3}
        onAction={() => setOpen(true)}
        extra={<Badge>{project.status}</Badge>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <Card className={`bg-gradient-to-br ${project.coverColor}`}>
            <CardContent className="grid gap-4 p-6 md:grid-cols-4">
              {[
                ["Total tasks", project.analytics.totalTasks],
                ["Completed", project.analytics.completedTasks],
                ["Active", project.analytics.activeTasks],
                ["Overdue", project.analytics.overdueTasks]
              ].map(([label, value]) => (
                <div key={label} className="rounded-[28px] border border-white/10 bg-black/10 p-4">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="headline mt-2 text-3xl font-semibold">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task overview</CardTitle>
              <CardDescription>Recent work items inside this project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.tasks.map((task) => (
                <div key={task._id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.status}</p>
                  </div>
                  {task.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <Avatar src={task.assignedTo.avatar} alt={task.assignedTo.name} className="h-9 w-9 rounded-xl" />
                      <span className="text-sm">{task.assignedTo.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
              <CardDescription>People collaborating in this workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.members.map((member) => (
                <div key={member._id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Avatar src={member.avatar} alt={member.name} />
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.email} • {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent project activity</CardTitle>
              <CardDescription>Updates captured directly on the project record.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.activityLog.map((entry, index) => (
                <div key={`${entry.createdAt}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-medium">{entry.message}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <ProjectFormDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleUpdate}
        project={project}
        members={members}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default ProjectDetailsPage

