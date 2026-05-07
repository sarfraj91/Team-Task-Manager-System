import { cn } from "@/lib/utils"

const Badge = ({ className, children }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200",
      className
    )}
  >
    {children}
  </span>
)

export { Badge }

