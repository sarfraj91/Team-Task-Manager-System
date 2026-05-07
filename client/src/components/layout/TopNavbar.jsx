import { Menu, Search } from "lucide-react"
import { useState } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import ThemeToggle from "@/components/common/ThemeToggle"
import NotificationMenu from "@/components/layout/NotificationMenu"
import UserMenu from "@/components/layout/UserMenu"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { navigationItems } from "@/lib/constants"
import { cn } from "@/lib/utils"

const TopNavbar = ({ onMenuClick }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentWorkspace } = useAuth()
  const [query, setQuery] = useState("")
  const quickLinks = navigationItems.slice(0, 4)
  const activeLabel =
    navigationItems.find((item) => location.pathname.startsWith(item.href))?.label || "Workspace"

  const handleSearch = (event) => {
    event.preventDefault()
    navigate(`/app/tasks?search=${encodeURIComponent(query)}`)
  }

  return (
    <header className="sticky top-0 z-30 px-4 pt-4">
      <div className="glass-panel flex flex-col gap-4 px-4 py-4 md:px-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onMenuClick}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-foreground xl:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="space-y-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current view</p>
                <p className="headline text-lg font-semibold">{activeLabel}</p>
              </div>
              {currentWorkspace ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 light:border-[#ddd2bd]">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Active workspace</p>
                  <p className="font-semibold">{currentWorkspace.name}</p>
                  <p className="text-xs text-muted-foreground">{currentWorkspace.teamCode}</p>
                </div>
              ) : null}
              <div className="hidden flex-wrap gap-2 md:flex">
                {quickLinks.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "rounded-full border border-white/10 px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/10 hover:text-foreground light:border-[#ddd2bd]",
                        isActive && "border-primary/40 bg-primary/10 text-foreground"
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <form onSubmit={handleSearch} className="relative w-full xl:min-w-[360px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-11"
                placeholder="Search tasks, projects, tags, or people"
              />
            </form>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <ThemeToggle />
              <NotificationMenu />
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopNavbar
