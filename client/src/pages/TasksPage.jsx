import { Edit3, Plus, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { createTask, deleteTask, getTasks, updateTask } from "@/api/tasks"
import { getProjects } from "@/api/projects"
import { getTeamMembers } from "@/api/users"
import EmptyState from "@/components/common/EmptyState"
import PageHeader from "@/components/common/PageHeader"
import SearchInput from "@/components/common/SearchInput"
import TaskFormDialog from "@/components/forms/TaskFormDialog"
import KanbanBoard from "@/components/kanban/KanbanBoard"
import TaskDetailsDialog from "@/components/modals/TaskDetailsDialog"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/useAuth"
import { buildTaskPayload, formatDate, getPriorityTone } from "@/lib/utils"

const TasksPage = () => {
  const { isAdmin, user } = useAuth()
  const [searchParams] = useSearchParams()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [members, setMembers] = useState([])
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingBoard, setIsSavingBoard] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    status: "",
    priority: "",
    project: "",
    mine: user?.role === "member"
  })

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [taskData, projectData, memberData] = await Promise.all([
        getTasks({
          ...filters,
          mine: filters.mine ? "true" : "false"
        }),
        getProjects(),
        getTeamMembers()
      ])
      setTasks(taskData.tasks)
      setProjects(projectData)
      setMembers(memberData)
    } catch (_error) {
      toast.error("Unable to load tasks")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filters.search, filters.status, filters.priority, filters.project, filters.mine])

  const taskSummary = useMemo(
    () => ({
      total: tasks.length,
      inProgress: tasks.filter((task) => task.status === "in-progress").length,
      review: tasks.filter((task) => task.status === "review").length,
      done: tasks.filter((task) => task.status === "done").length
    }),
    [tasks]
  )

  const handleTaskSubmit = async (values) => {
    setIsSubmitting(true)
    try {
      if (editingTask) {
        await updateTask(editingTask._id, {
          ...values,
          tags: values.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        })
        toast.success("Task updated")
      } else {
        const payload = buildTaskPayload(values)
        await createTask(payload)
        toast.success("Task created")
      }
      setTaskDialogOpen(false)
      setEditingTask(null)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save task")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMoveTask = async (task, nextStatus) => {
    if (!isAdmin && ["review", "done"].includes(nextStatus)) {
      toast.error("Members need to use the task details screen to submit work for admin review")
      return
    }

    try {
      setIsSavingBoard(true)
      const nextPosition = tasks.filter((item) => item.status === nextStatus).length
      await updateTask(task._id, { status: nextStatus, position: nextPosition })
      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item._id === task._id
            ? {
                ...item,
                status: nextStatus,
                position: nextPosition
              }
            : item
        )
      )
      toast.success("Task moved")
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to move task")
    } finally {
      setIsSavingBoard(false)
    }
  }

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId)
      toast.success("Task deleted")
      fetchData()
    } catch (_error) {
      toast.error("Unable to delete task")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tasks"
        title="Create, assign, and move work."
        description="Track task status, comments, files, priorities, and assignees from one board."
        actionLabel={isAdmin ? "Create task" : undefined}
        actionIcon={Plus}
        onAction={() => {
          setEditingTask(null)
          setTaskDialogOpen(true)
        }}
        extra={
          <div className="grid gap-3 md:grid-cols-4">
            <SearchInput
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search tasks"
            />
            <Select value={filters.project} onChange={(event) => setFilters((current) => ({ ...current, project: event.target.value }))}>
              <option value="">All projects</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </Select>
            <Select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
              <option value="">All statuses</option>
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </Select>
            <Select value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}>
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </div>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total tasks", taskSummary.total],
          ["In progress", taskSummary.inProgress],
          ["In review", taskSummary.review],
          ["Done", taskSummary.done]
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="headline mt-3 text-4xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-[520px] w-full" />
      ) : tasks.length ? (
        <>
          <KanbanBoard
            tasks={tasks}
            onTaskClick={(task) => setSelectedTaskId(task._id)}
            onMoveTask={handleMoveTask}
            isSaving={isSavingBoard}
          />

          <Card>
            <CardHeader>
              <CardTitle>Task list</CardTitle>
              <CardDescription>Detailed view for scanning assignees, deadlines, and quick actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.map((task) => (
                <div key={task._id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{task.title}</p>
                      <Badge className={getPriorityTone(task.priority)}>{task.priority}</Badge>
                      <Badge>{task.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {task.project?.title} • Due {formatDate(task.dueDate)}
                    </p>
                    {task.completionWorkflow?.state === "pending" ? (
                      <p className="text-sm text-amber-300">Awaiting admin verification</p>
                    ) : null}
                    {task.completionWorkflow?.state === "reassigned" ? (
                      <p className="text-sm text-primary">Reassigned with admin feedback</p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {task.assignedTo ? <Avatar src={task.assignedTo.avatar} alt={task.assignedTo.name} className="h-9 w-9 rounded-xl" /> : null}
                    <Button variant="secondary" onClick={() => setSelectedTaskId(task._id)}>
                      Details
                    </Button>
                    {isAdmin ? (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setEditingTask(task)
                            setTaskDialogOpen(true)
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="danger" onClick={() => handleDelete(task._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState
          icon={Plus}
          title="No tasks match your filters"
          description="Clear the filters or create a task to start moving work."
          actionLabel={isAdmin ? "Create task" : undefined}
          onAction={isAdmin ? () => setTaskDialogOpen(true) : undefined}
        />
      )}

      <TaskFormDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSubmit={handleTaskSubmit}
        task={editingTask}
        projects={projects}
        members={members}
        allowAttachments={!editingTask}
        isSubmitting={isSubmitting}
      />

      <TaskDetailsDialog
        open={Boolean(selectedTaskId)}
        onOpenChange={(value) => {
          if (!value) {
            setSelectedTaskId(null)
          }
        }}
        taskId={selectedTaskId}
        onChanged={() => fetchData()}
      />
    </div>
  )
}

export default TasksPage
