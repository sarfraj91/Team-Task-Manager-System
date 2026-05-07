import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const PageHeader = ({ eyebrow, title, description, actionLabel, onAction, actionIcon: ActionIcon, extra }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
  >
    <div className="space-y-3">
      {eyebrow ? <Badge className="w-fit">{eyebrow}</Badge> : null}
      <div className="space-y-2">
        <h1 className="headline text-3xl font-semibold md:text-4xl">{title}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-3">
      {extra}
      {actionLabel ? (
        <Button onClick={onAction}>
          {ActionIcon ? <ActionIcon className="h-4 w-4" /> : null}
          {actionLabel}
        </Button>
      ) : null}
    </div>
  </motion.div>
)

export default PageHeader

