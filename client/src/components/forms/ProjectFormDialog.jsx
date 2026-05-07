import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Avatar } from "@/components/ui/avatar"
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
import { projectGradients, projectStatuses } from "@/lib/constants"

const schema = z.object({
  title: z.string().min(3, "Project title must be at least 3 characters"),
  description: z.string().max(500, "Description is too long").optional(),
  status: z.string().min(1, "Choose a status"),
  coverColor: z.string().min(1, "Choose a style"),
  members: z.array(z.string()).default([])
})

const ProjectFormDialog = ({ open, onOpenChange, onSubmit, project, members = [], isSubmitting }) => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      status: "active",
      coverColor: projectGradients[0],
      members: []
    }
  })

  useEffect(() => {
    if (open) {
      reset({
        title: project?.title || "",
        description: project?.description || "",
        status: project?.status || "active",
        coverColor: project?.coverColor || projectGradients[0],
        members: project?.members?.map((member) => member._id) || []
      })
    }
  }, [open, project, reset])

  const selectedMembers = watch("members")
  const selectedColor = watch("coverColor")

  const toggleMember = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setValue(
        "members",
        selectedMembers.filter((id) => id !== memberId),
        { shouldValidate: true }
      )
      return
    }

    setValue("members", [...selectedMembers, memberId], { shouldValidate: true })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto premium-scrollbar">
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "Create project"}</DialogTitle>
          <DialogDescription>Set the project details, style, and member list.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="project-title">Title</Label>
            <Input id="project-title" placeholder="Launch Sprint" {...register("title")} />
            {errors.title ? <p className="text-sm text-rose-300">{errors.title.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea id="project-description" placeholder="Describe the project outcome, scope, and momentum." {...register("description")} />
            {errors.description ? <p className="text-sm text-rose-300">{errors.description.message}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select {...register("status")}>
                {projectStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="grid grid-cols-4 gap-3">
                {projectGradients.map((gradient) => (
                  <button
                    key={gradient}
                    type="button"
                    onClick={() => setValue("coverColor", gradient, { shouldValidate: true })}
                    className={`h-12 rounded-2xl border ${
                      selectedColor === gradient ? "border-cyan-300" : "border-white/10"
                    } bg-gradient-to-r ${gradient}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Members</Label>
            <div className="grid max-h-[320px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
              {members.map((member) => (
                <button
                  key={member._id}
                  type="button"
                  onClick={() => toggleMember(member._id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedMembers.includes(member._id)
                      ? "border-primary/60 bg-primary/10"
                      : "border-white/10 bg-white/5 hover:bg-white/8"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={member.avatar} alt={member.name} className="h-10 w-10 rounded-2xl" />
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.email} • {member.role}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">The project creator is always included automatically.</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {project ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ProjectFormDialog
