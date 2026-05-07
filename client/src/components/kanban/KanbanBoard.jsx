import { motion } from "framer-motion"
import { CircleDashed, Eye, ListTodo, LoaderCircle, Rocket, SquareCheckBig } from "lucide-react"
import TaskCard from "@/components/kanban/TaskCard"
import { taskStatuses } from "@/lib/constants"

const iconMap = {
  backlog: CircleDashed,
  todo: ListTodo,
  "in-progress": Rocket,
  review: Eye,
  done: SquareCheckBig
}

const KanbanBoard = ({ tasks = [], onTaskClick, onMoveTask, isSaving }) => {
  const groupedTasks = taskStatuses.reduce((accumulator, status) => {
    accumulator[status.value] = tasks.filter((task) => task.status === status.value)
    return accumulator
  }, {})

  return (
    <div className="grid gap-5 xl:grid-cols-5">
      {taskStatuses.map((status) => {
        const Icon = iconMap[status.value]
        return (
          <div
            key={status.value}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              const task = JSON.parse(event.dataTransfer.getData("task"))
              onMoveTask(task, status.value)
            }}
            className="glass-panel min-h-[420px] p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <Icon className="h-4 w-4 text-cyan-200" />
                </div>
                <div>
                  <p className="font-semibold">{status.label}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {groupedTasks[status.value]?.length || 0} items
                  </p>
                </div>
              </div>
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin text-cyan-300" /> : null}
            </div>

            <div className="space-y-3">
              {groupedTasks[status.value]?.map((task, index) => (
                <motion.div key={task._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                  <TaskCard
                    task={task}
                    onClick={() => onTaskClick(task)}
                    onDragStart={(event) => {
                      event.dataTransfer.setData("task", JSON.stringify(task))
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default KanbanBoard

