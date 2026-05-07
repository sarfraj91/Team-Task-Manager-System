import { appName } from "@/lib/constants"

const Logo = ({ compact = false }) => (
  <div className="flex items-center gap-3">
    <div className="relative h-11 w-11 shrink-0">
      <div className="absolute inset-0 rotate-6 rounded-[18px] bg-gradient-to-br from-primary via-sky-500 to-amber-300 shadow-lg shadow-primary/20" />
      <div className="absolute inset-[3px] rounded-[16px] bg-slate-950/85 light:bg-white/90" />
      <div className="absolute left-[11px] top-[10px] h-3 w-3 rounded-full bg-amber-300" />
      <div className="absolute right-[10px] top-[10px] h-3 w-3 rounded-md bg-sky-300" />
      <div className="absolute bottom-[10px] left-1/2 h-3 w-5 -translate-x-1/2 rounded-full bg-primary" />
    </div>
    {!compact && (
      <div>
        <p className="headline text-lg font-semibold">{appName}</p>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Project Workspace</p>
      </div>
    )}
  </div>
)

export default Logo
