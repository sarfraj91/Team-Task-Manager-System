import { MoonStar, SunMedium } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/hooks/useTheme"

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 light:border-slate-200 light:bg-white">
      <MoonStar className="h-4 w-4 text-muted-foreground" />
      <Switch checked={theme === "light"} onCheckedChange={toggleTheme} />
      <SunMedium className="h-4 w-4 text-muted-foreground" />
    </div>
  )
}

export default ThemeToggle

