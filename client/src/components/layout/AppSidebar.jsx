import { motion } from "framer-motion"
import { PanelLeftClose } from "lucide-react"
import { Link, NavLink } from "react-router-dom"
import Logo from "@/components/common/Logo"
import { navigationItems } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"

const AppSidebar = ({ mobileOpen, setMobileOpen }) => {
  const { currentWorkspace, isAdmin, user } = useAuth()

  const content = (
    <div className="glass-panel premium-scrollbar flex h-full flex-col overflow-y-auto p-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 light:border-[#e6dcc9]">
        <Logo />
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 xl:hidden"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <nav className="mt-6 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-white/8 hover:text-foreground",
                isActive && "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Quick links</p>
        <div className="grid gap-3">
          {[
            {
              label: "Projects",
              href: "/app/projects",
              caption: isAdmin ? "Create and manage project spaces" : "See project workspaces"
            },
            {
              label: "Tasks",
              href: "/app/tasks",
              caption: isAdmin ? "Assign work and move tasks" : "Update assigned work"
            },
            {
              label: "Members",
              href: "/app/members",
              caption: "See everyone in the active workspace"
            },
            {
              label: "Workspace",
              href: "/app/workspace",
              caption: isAdmin ? "Create and switch team workspaces" : "View your active team workspace"
            },
            {
              label: "Profile",
              href: "/app/settings",
              caption: "Update your avatar and profile details"
            }
          ].map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className="surface-panel p-4 transition hover:bg-white/10"
            >
              <p className="font-semibold">{item.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.caption}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-auto rounded-[28px] border border-white/10 bg-white/5 p-4 light:border-[#e6dcc9]">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Signed in as</p>
        <p className="mt-3 font-semibold text-foreground">{user?.name}</p>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        {currentWorkspace ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-3 light:border-[#d7ccb7]">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Active workspace</p>
            <p className="mt-2 font-semibold">{currentWorkspace.name}</p>
            <p className="text-sm text-muted-foreground">{currentWorkspace.teamCode}</p>
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground light:border-[#d7ccb7]">
            {user?.role}
          </span>
          {user?.isEmailVerified ? (
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-foreground">
              verified
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden w-[300px] shrink-0 p-4 xl:block">{content}</aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm xl:hidden" onClick={() => setMobileOpen(false)} />
      ) : null}

      <motion.aside
        initial={false}
        animate={{ x: mobileOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[320px] p-4 xl:hidden"
      >
        {content}
      </motion.aside>
    </>
  )
}

export default AppSidebar
