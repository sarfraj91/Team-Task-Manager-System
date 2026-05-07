import { CheckCircle2, Paperclip, RotateCcw, Send } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  addTaskComment,
  getTask,
  reviewTaskSubmission,
  submitTaskForReview,
  uploadTaskAttachments
} from "@/api/tasks"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { formatDate, formatRelativeTime, getPriorityTone, getStatusTone } from "@/lib/utils"

const TaskDetailsDialog = ({ open, onOpenChange, taskId, onChanged }) => {
  const { isAdmin, user } = useAuth()
  const [task, setTask] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [comment, setComment] = useState("")
  const [files, setFiles] = useState(null)
  const [memberNote, setMemberNote] = useState("")
  const [reviewFeedback, setReviewFeedback] = useState("")
  const [reassignTo, setReassignTo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId || !open) {
        return
      }

      setIsLoading(true)
      try {
        const response = await getTask(taskId)
        setTask(response)
      } catch (_error) {
        toast.error("Unable to load task details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTask()
  }, [open, taskId])

  useEffect(() => {
    if (!task) {
      return
    }

    setMemberNote("")
    setReviewFeedback(task.completionWorkflow?.adminFeedback || "")
    setReassignTo(task.assignedTo?._id || "")
  }, [task])

  const workflowState = task?.completionWorkflow?.state || "idle"
  const isAssignedMember =
    user?.role === "member" && task?.assignedTo?._id?.toString() === user?._id?.toString()
  const projectMembers = useMemo(() => task?.project?.members || [], [task?.project?.members])
  const canMemberSubmit = isAssignedMember && task?.status !== "done" && workflowState !== "pending"
  const isAwaitingAdminReview = workflowState === "pending" && task?.status === "review"
  const needsAdminReview = isAdmin && isAwaitingAdminReview

  const applyUpdatedTask = (updatedTask) => {
    setTask(updatedTask)
    onChanged?.(updatedTask)
  }

  const handleComment = async () => {
    if (!comment.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      const updatedTask = await addTaskComment(taskId, { message: comment })
      applyUpdatedTask(updatedTask)
      setComment("")
      toast.success("Comment added")
    } catch (_error) {
      toast.error("Unable to add comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpload = async () => {
    if (!files?.length) {
      return
    }

    setIsSubmitting(true)
    try {
      const updatedTask = await uploadTaskAttachments(taskId, files)
      applyUpdatedTask(updatedTask)
      setFiles(null)
      toast.success("Attachments uploaded")
    } catch (_error) {
      toast.error("Unable to upload files")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitForReview = async () => {
    setIsSubmitting(true)
    try {
      const updatedTask = await submitTaskForReview(taskId, {
        memberNote
      })
      applyUpdatedTask(updatedTask)
      setMemberNote("")
      toast.success("Task submitted for admin review")
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit task for review")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApprove = async () => {
    setIsSubmitting(true)
    try {
      const updatedTask = await reviewTaskSubmission(taskId, {
        action: "approve",
        adminFeedback: reviewFeedback
      })
      applyUpdatedTask(updatedTask)
      toast.success("Task approved and completed")
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to approve task")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReassign = async () => {
    if (!reassignTo) {
      toast.error("Choose the member you want to reassign this task to")
      return
    }

    if (!reviewFeedback.trim()) {
      toast.error("Add a short note describing what needs to be changed")
      return
    }

    setIsSubmitting(true)
    try {
      const updatedTask = await reviewTaskSubmission(taskId, {
        action: "reassign",
        assignedTo: reassignTo,
        adminFeedback: reviewFeedback
      })
      applyUpdatedTask(updatedTask)
      toast.success("Task reassigned")
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to reassign task")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto premium-scrollbar">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : task ? (
          <>
            <DialogHeader>
              <DialogTitle>{task.title}</DialogTitle>
              <DialogDescription>{task.project?.title}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
              <div className="space-y-6">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getPriorityTone(task.priority)}>{task.priority}</Badge>
                    <Badge className={getStatusTone(task.status)}>{task.status.replace("-", " ")}</Badge>
                    {workflowState !== "idle" ? (
                      <Badge variant="secondary">
                        {workflowState === "pending"
                          ? "awaiting admin review"
                          : workflowState === "approved"
                            ? "approved"
                            : "reassigned"}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {task.description || "No detailed description has been added yet."}
                  </p>
                </div>

                {task.completionWorkflow?.memberNote || task.completionWorkflow?.adminFeedback ? (
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                    <h3 className="headline text-lg font-semibold">Review workflow</h3>
                    <div className="mt-4 space-y-4 text-sm">
                      {task.completionWorkflow?.memberNote ? (
                        <div className="rounded-2xl border border-white/10 p-4">
                          <p className="font-semibold">Member submission</p>
                          <p className="mt-2 text-muted-foreground">{task.completionWorkflow.memberNote}</p>
                          {task.completionWorkflow.submittedAt ? (
                            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                              {task.completionWorkflow.submittedBy?.name || "Member"} •{" "}
                              {formatRelativeTime(task.completionWorkflow.submittedAt)}
                            </p>
                          ) : null}
                        </div>
                      ) : null}

                      {task.completionWorkflow?.adminFeedback ? (
                        <div className="rounded-2xl border border-white/10 p-4">
                          <p className="font-semibold">Admin feedback</p>
                          <p className="mt-2 text-muted-foreground">{task.completionWorkflow.adminFeedback}</p>
                          {task.completionWorkflow.reviewedAt ? (
                            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                              {task.completionWorkflow.reviewedBy?.name || "Admin"} •{" "}
                              {formatRelativeTime(task.completionWorkflow.reviewedAt)}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {canMemberSubmit ? (
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                    <h3 className="headline text-lg font-semibold">Submit work to admin</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Mark this task as done from the member side and send it to the admin for final verification.
                    </p>
                    <div className="mt-4 space-y-3">
                      <Textarea
                        value={memberNote}
                        onChange={(event) => setMemberNote(event.target.value)}
                        placeholder="Add a short update about what was completed."
                      />
                      <Button onClick={handleSubmitForReview} disabled={isSubmitting}>
                        <CheckCircle2 className="h-4 w-4" />
                        Submit as done
                      </Button>
                    </div>
                  </div>
                ) : null}

                {isAssignedMember && isAwaitingAdminReview ? (
                  <div className="rounded-[28px] border border-primary/20 bg-primary/10 p-5">
                    <h3 className="headline text-lg font-semibold">Waiting for admin verification</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Your submission is pending admin review. Once approved, the task will move to completed.
                    </p>
                  </div>
                ) : null}

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="headline text-lg font-semibold">Comments</h3>
                    <p className="text-sm text-muted-foreground">{task.comments?.length || 0} total</p>
                  </div>
                  <div className="mt-4 space-y-4">
                    {task.comments?.map((entry, index) => (
                      <div
                        key={`${entry.author?._id || index}-${entry.createdAt}`}
                        className="flex gap-3 rounded-2xl border border-white/10 p-4"
                      >
                        <Avatar
                          src={entry.author?.avatar}
                          alt={entry.author?.name}
                          className="h-10 w-10 rounded-xl"
                        />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">{entry.author?.name}</p>
                          <p className="text-sm text-muted-foreground">{entry.message}</p>
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            {formatRelativeTime(entry.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {!task.comments?.length ? (
                      <p className="text-sm text-muted-foreground">No comments yet.</p>
                    ) : null}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Input
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      placeholder="Add a thoughtful update or blocker note"
                    />
                    <Button onClick={handleComment} disabled={isSubmitting}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {needsAdminReview ? (
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                    <h3 className="headline text-lg font-semibold">Admin review</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Verify the member response, then complete the task or reassign it with feedback.
                    </p>
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Feedback</label>
                        <Textarea
                          value={reviewFeedback}
                          onChange={(event) => setReviewFeedback(event.target.value)}
                          placeholder="Add confirmation notes or explain what needs to change."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Reassign to</label>
                        <Select value={reassignTo} onChange={(event) => setReassignTo(event.target.value)}>
                          <option value="">Choose a member</option>
                          {projectMembers.map((member) => (
                            <option key={member._id} value={member._id}>
                              {member.name}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="flex flex-col gap-3">
                        <Button onClick={handleApprove} disabled={isSubmitting}>
                          <CheckCircle2 className="h-4 w-4" />
                          Verify and complete
                        </Button>
                        <Button variant="secondary" onClick={handleReassign} disabled={isSubmitting}>
                          <RotateCcw className="h-4 w-4" />
                          Reassign with feedback
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <h3 className="headline text-lg font-semibold">Task details</h3>
                  <div className="mt-4 space-y-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Assignee</span>
                      {task.assignedTo ? (
                        <div className="flex items-center gap-2 font-medium">
                          <Avatar
                            src={task.assignedTo.avatar}
                            alt={task.assignedTo.name}
                            className="h-8 w-8 rounded-xl"
                          />
                          {task.assignedTo.name}
                        </div>
                      ) : (
                        <span>Unassigned</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Due date</span>
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Tags</span>
                      <span>{task.tags?.join(", ") || "None"}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="headline text-lg font-semibold">Attachments</h3>
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {task.attachments?.map((attachment, index) => (
                      <a
                        key={`${attachment.url}-${index}`}
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-2xl border border-white/10 px-4 py-3 text-sm transition hover:bg-white/5"
                      >
                        <p className="font-medium">{attachment.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </a>
                    ))}
                    {!task.attachments?.length ? (
                      <p className="text-sm text-muted-foreground">No files attached yet.</p>
                    ) : null}
                  </div>
                  <div className="mt-4 space-y-3">
                    <Input type="file" multiple onChange={(event) => setFiles(event.target.files)} />
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={handleUpload}
                      disabled={isSubmitting}
                    >
                      Upload files
                    </Button>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <h3 className="headline text-lg font-semibold">Activity log</h3>
                  <div className="mt-4 space-y-3">
                    {task.activityLog?.map((entry, index) => (
                      <div key={`${entry.createdAt}-${index}`} className="rounded-2xl border border-white/10 p-4">
                        <p className="text-sm font-medium">{entry.message}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          {formatRelativeTime(entry.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export default TaskDetailsDialog
