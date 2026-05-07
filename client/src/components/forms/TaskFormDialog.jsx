import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { priorities, taskStatuses } from "@/lib/constants"

const ALL_TEAM_MEMBERS = "all-team-members"

const schema = z.object({
  title: z.string().min(3, "Task title must be at least 3 characters"),
  description: z.string().optional(),
  project: z.string().min(1, "Select a project"),
  assignedTo: z.string().optional(),
  priority: z.string().min(1, "Select a priority"),
  status: z.string().min(1, "Select a status"),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
  attachments: z.any().optional()
})

const TaskFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  task,
  projects = [],
  members = [],
  isSubmitting,
  allowAttachments = true
}) => {
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      project: "",
      assignedTo: "",
      priority: "medium",
      status: "todo",
      dueDate: "",
      tags: "",
      attachments: undefined
    }
  })

  useEffect(() => {
    if (open) {
      reset({
        title: task?.title || "",
        description: task?.description || "",
        project: task?.project?._id || "",
        assignedTo: task?.assignedTo?._id || "",
        priority: task?.priority || "medium",
        status: task?.status || "todo",
        dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
        tags: task?.tags?.join(", ") || "",
        attachments: undefined
      })
    }
  }, [open, task, reset])

  const selectedProjectId = watch("project")
  const selectedAssignee = watch("assignedTo")
  const availableMembers = useMemo(() => {
    const selectedProject = projects.find((project) => project._id === selectedProjectId)
    return selectedProject?.members || []
  }, [projects, selectedProjectId])

  useEffect(() => {
    if (
      selectedAssignee &&
      selectedAssignee !== ALL_TEAM_MEMBERS &&
      !availableMembers.some((member) => member._id === selectedAssignee)
    ) {
      setValue("assignedTo", "")
    }
  }, [availableMembers, selectedAssignee, setValue])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto premium-scrollbar">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "Create task"}</DialogTitle>
          <DialogDescription>Choose the project first, then assign the task to one of its members.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" placeholder="Finalize launch messaging" {...register("title")} />
            {errors.title ? <p className="text-sm text-rose-300">{errors.title.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea id="task-description" placeholder="Add the key notes, scope, and expected delivery." {...register("description")} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select {...register("project")}>
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </Select>
              {errors.project ? <p className="text-sm text-rose-300">{errors.project.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select {...register("assignedTo")}>
                <option value="">Unassigned</option>
                {!task && selectedProjectId ? (
                  <option value={ALL_TEAM_MEMBERS}>All team members</option>
                ) : null}
                {availableMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </Select>
              <p className="text-sm text-muted-foreground">
                {selectedProjectId
                  ? "Choose one member or assign the task to all members in the selected project."
                  : "Select a project to load its members."}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select {...register("priority")}>
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select {...register("status")}>
                {taskStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-due-date">Due date</Label>
              <Input id="task-due-date" type="date" {...register("dueDate")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-tags">Tags</Label>
            <Input id="task-tags" placeholder="release, ui polish, blockers" {...register("tags")} />
          </div>

          {allowAttachments && !task ? (
            <div className="space-y-2">
              <Label htmlFor="task-files">Attachments</Label>
              <Input id="task-files" type="file" multiple {...register("attachments")} />
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {task ? "Save task" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default TaskFormDialog
