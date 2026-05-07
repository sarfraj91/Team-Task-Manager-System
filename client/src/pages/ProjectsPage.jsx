import { Edit3, FolderKanban, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { createProject, deleteProject, getProjects, updateProject } from "@/api/projects"
import { getTeamMembers } from "@/api/users"
import EmptyState from "@/components/common/EmptyState"
import PageHeader from "@/components/common/PageHeader"
import SearchInput from "@/components/common/SearchInput"
import ProjectFormDialog from "@/components/forms/ProjectFormDialog"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/useAuth"
import { getProgressValue } from "@/lib/utils"

const ProjectsPage = () => {
  const { isAdmin } = useAuth()
  const [projects, setProjects] = useState([])
  const [members, setMembers] = useState([])
  const [filters, setFilters] = useState({ search: "", status: "" })
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [activeProject, setActiveProject] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [projectData, memberData] = await Promise.all([getProjects(filters), getTeamMembers()])
      setProjects(projectData)
      setMembers(memberData)
    } catch (_error) {
      toast.error("Unable to load projects")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filters.search, filters.status])

  const handleSubmit = async (values) => {
    setIsSubmitting(true)
    try {
      if (activeProject) {
        await updateProject(activeProject._id, values)
        toast.success("Project updated")
      } else {
        await createProject(values)
        toast.success("Project created")
      }
      setOpen(false)
      setActiveProject(null)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save project")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (projectId) => {
    try {
      await deleteProject(projectId)
      toast.success("Project deleted")
      fetchData()
    } catch (_error) {
      toast.error("Unable to delete project")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Projects"
        // title="Create and manage project workspaces."
        // description="Set status, choose members, and track project progress from one screen."
        actionLabel={isAdmin ? "Create project" : undefined}
        actionIcon={Plus}
        onAction={() => {
          setActiveProject(null)
          setOpen(true)
        }}
        extra={
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchInput
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search projects"
            />
            <Select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
              <option value="">All statuses</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </Select>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[290px] w-full" />
          ))}
        </div>
      ) : projects.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const progress = getProgressValue(project.summary.completedTasks, project.summary.totalTasks)

            return (
              <Card key={project._id} className={`overflow-hidden bg-gradient-to-br ${project.coverColor}`}>
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge>{project.status}</Badge>
                      <h3 className="headline mt-4 text-2xl font-semibold">{project.title}</h3>
                    </div>
                    {isAdmin ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => {
                            setActiveProject(project)
                            setOpen(true)
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="danger" onClick={() => handleDelete(project._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">
                    {project.description || "No description added yet."}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{progress}% complete</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/8">
                      <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-[28px] border border-white/10 bg-black/10 p-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tasks</p>
                      <p className="mt-1 font-semibold">{project.summary.totalTasks}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Overdue</p>
                      <p className="mt-1 font-semibold">{project.summary.overdueTasks}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 4).map((member) => (
                        <Avatar key={member._id} src={member.avatar} alt={member.name} className="h-9 w-9 rounded-xl border-2 border-slate-950" />
                      ))}
                    </div>
                    <Button variant="secondary" asChild>
                      <Link to={`/app/projects/${project._id}`}>Open workspace</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Create your first project to start assigning members and tracking work."
          actionLabel={isAdmin ? "Create project" : undefined}
          onAction={isAdmin ? () => setOpen(true) : undefined}
        />
      )}

      <ProjectFormDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        project={activeProject}
        members={members}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default ProjectsPage
