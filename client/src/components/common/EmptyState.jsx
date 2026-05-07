import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-panel flex min-h-[280px] flex-col items-center justify-center gap-4 p-8 text-center"
  >
    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-300">
      <Icon className="h-8 w-8" />
    </div>
    <div className="space-y-2">
      <h3 className="headline text-2xl font-semibold">{title}</h3>
      <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
    {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
  </motion.div>
)

export default EmptyState

