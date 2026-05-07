import { CalendarClock, CircleAlert } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, getPriorityTone, isOverdue } from "@/lib/utils"

const UpcomingTasksList = ({ items = [] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Upcoming work</CardTitle>
      <CardDescription>Deadlines that deserve attention this week.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {items.map((task) => (
        <div key={task._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="font-semibold">{task.title}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getPriorityTone(task.priority)}>{task.priority}</Badge>
                <span className="text-sm text-muted-foreground">{task.project?.title}</span>
              </div>
            </div>
            {task.assignedTo ? <Avatar src={task.assignedTo.avatar} alt={task.assignedTo.name} className="h-9 w-9 rounded-xl" /> : null}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            {isOverdue(task) ? <CircleAlert className="h-4 w-4 text-rose-300" /> : <CalendarClock className="h-4 w-4" />}
            {formatDate(task.dueDate)}
          </div>
        </div>
      ))}
      {!items.length ? <p className="text-sm text-muted-foreground">No upcoming tasks. Your board is in a good place.</p> : null}
    </CardContent>
  </Card>
)

export default UpcomingTasksList

