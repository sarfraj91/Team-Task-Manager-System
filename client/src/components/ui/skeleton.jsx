import { cn } from "@/lib/utils"

const Skeleton = ({ className }) => <div className={cn("animate-pulse rounded-2xl bg-white/8 light:bg-slate-200", className)} />

export { Skeleton }

