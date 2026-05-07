import {
  Activity,
  Building2,
  FolderKanban,
  Github,
  House,
  Linkedin,
  LayoutGrid,
  LayoutDashboard,
  Settings,
  ShieldCheck
} from "lucide-react"
import { Users } from "lucide-react"

export const appName = import.meta.env.VITE_APP_NAME || "TaskFlow Pro"

export const navigationItems = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/app/projects", icon: FolderKanban },
  { label: "Tasks", href: "/app/tasks", icon: LayoutGrid },
  { label: "Activity", href: "/app/activity", icon: Activity },
  { label: "Members", href: "/app/members", icon: Users },
  { label: "Workspace", href: "/app/workspace", icon: Building2 },
  { label: "Settings", href: "/app/settings", icon: Settings }
]

export const marketingLinks = [
  { label: "Overview", href: "#overview" },
  { label: "Workflow", href: "#workflow" },
  { label: "Teams", href: "#teams" },
  { label: "Roles", href: "#roles" },
  { label: "Profile", href: "#profile" }
]

export const socialLinks = [
  { label: "GitHub", href: "https://github.com", icon: Github },
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: Linkedin },
  { label: "Website", href: "https://example.com", icon: House }
]

export const taskStatuses = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" }
]

export const projectStatuses = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "on-hold", label: "On Hold" },
  { value: "completed", label: "Completed" }
]

export const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" }
]

export const projectGradients = [
  "from-cyan-500/20 via-blue-500/15 to-indigo-500/10",
  "from-emerald-500/20 via-teal-500/15 to-cyan-500/10",
  "from-violet-500/20 via-fuchsia-500/15 to-blue-500/10",
  "from-amber-500/20 via-orange-500/15 to-rose-500/10"
]

export const roleOptions = [
  {
    value: "admin",
    label: "Admin",
    icon: ShieldCheck
  },
  {
    value: "member",
    label: "Member",
    icon: Users
  }
]
