import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "@/lib/utils"

const Label = ({ className, ...props }) => (
  <LabelPrimitive.Root className={cn("text-sm font-medium text-slate-200 light:text-slate-700", className)} {...props} />
)

export { Label }

