import { CalendarClock, MessageSquareMore, Paperclip } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDate, getPriorityTone, isOverdue } from "@/lib/utils"

const TaskCard = ({ task, onClick, draggable = true, onDragStart }) => (
  <button
    type="button"
    draggable={draggable}
    onDragStart={onDragStart}
    onClick={onClick}
    className="w-full rounded-[28px] border border-white/10 bg-white/6 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/10"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-2">
        <Badge className={getPriorityTone(task.priority)}>{task.priority}</Badge>
        {task.completionWorkflow?.state === "pending" ? (
          <Badge variant="secondary">awaiting admin</Badge>
        ) : null}
        {task.completionWorkflow?.state === "reassigned" ? (
          <Badge variant="secondary">needs changes</Badge>
        ) : null}
        <p className="text-sm font-semibold leading-relaxed">{task.title}</p>
      </div>
      {task.assignedTo ? <Avatar src={task.assignedTo.avatar} alt={task.assignedTo.name} className="h-9 w-9 rounded-xl" /> : null}
    </div>

    {task.description ? <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{task.description}</p> : null}

    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      {task.dueDate ? (
        <span className={`inline-flex items-center gap-1.5 ${isOverdue(task) ? "text-rose-300" : ""}`}>
          <CalendarClock className="h-3.5 w-3.5" />
          {formatDate(task.dueDate)}
        </span>
      ) : null}
      <span className="inline-flex items-center gap-1.5">
        <MessageSquareMore className="h-3.5 w-3.5" />
        {task.comments?.length || 0}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Paperclip className="h-3.5 w-3.5" />
        {task.attachments?.length || 0}
      </span>
    </div>
  </button>
)

export default TaskCard
