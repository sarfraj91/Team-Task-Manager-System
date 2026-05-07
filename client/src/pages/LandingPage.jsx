import { motion } from "framer-motion"
import {
  ArrowRight,
  BriefcaseBusiness,
  Github,
  LayoutDashboard,
  Linkedin,
  MailCheck,
  ShieldCheck,
  UserRound
} from "lucide-react"
import { Link } from "react-router-dom"
import Logo from "@/components/common/Logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { marketingLinks } from "@/lib/constants"

const features = [
  {
    icon: BriefcaseBusiness,
    title: "Independent team workspaces",
    description: "Create multiple workspaces, generate team codes, and keep every team fully isolated."
  },
  {
    icon: LayoutDashboard,
    title: "Tasks with clear ownership",
    description: "Assign tasks to project members, move work across stages, and keep deadlines visible."
  },
  {
    icon: MailCheck,
    title: "OTP email verification",
    description: "Validate every signup with SMTP email OTP before the account can be used."
  },
  {
    icon: UserRound,
    title: "Editable user profiles",
    description: "Update avatar, bio, and location without touching the account email."
  }
]

const LandingPage = () => (
  <div className="container min-h-screen py-6 md:py-8">
    <header className="glass-panel flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <Logo />
      <nav className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {marketingLinks.map((link) => (
          <a key={link.href} href={link.href} className="transition hover:text-foreground">
            {link.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        {/* <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10"
        >
          <Github className="h-4 w-4" />
        </a> */}
        {/* <a
          href="https://www.linkedin.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10"
        >
          <Linkedin className="h-4 w-4" />
        </a> */}
        <Button variant="ghost" asChild>
          <Link to="/login">Sign in</Link>
        </Button>
        <Button asChild>
          <Link to="/register">Create account</Link>
        </Button>
      </div>
    </header>

    <section
      id="overview"
      className="grid items-center gap-10 py-14 lg:grid-cols-[1.02fr_0.98fr]"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Badge>Multi-team workspace platform</Badge>
        <div className="space-y-4">
          <h1 className="headline text-5xl font-semibold leading-tight md:text-6xl">
            Run multiple teams with secure workspaces, team codes, and task delivery in one product.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            Built for real collaboration flow: admin-created workspaces, member signup by team code,
            email OTP verification, project ownership, and clean task assignment across separate teams.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button size="lg" asChild>
            <Link to="/register">
              Start workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/login">Open existing account</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Workspace mode", "Create or join by code"],
            ["Email check", "6 digit SMTP OTP"],
            ["Profiles", "Avatar and edit form"]
          ].map(([label, value]) => (
            <div key={label} className="surface-panel p-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08 }}
        className="glass-panel grid-sheen overflow-hidden p-5 md:p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Live workspace</p>
            <h2 className="headline mt-2 text-2xl font-semibold">Product Launch Board</h2>
          </div>
          <Badge>4 active members</Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Backlog",
              items: ["Create onboarding copy", "Review design QA list"]
            },
            {
              title: "In Progress",
              items: ["Assign launch tasks", "Verify new signups"]
            },
            {
              title: "Review",
              items: ["Update navbar links", "Check member access"]
            }
          ].map((column) => (
            <div key={column.title} className="surface-panel p-4">
              <p className="font-semibold">{column.title}</p>
              <div className="mt-4 space-y-3">
                {column.items.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-muted-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>

    <section id="workflow" className="grid gap-5 pb-10 md:grid-cols-2 xl:grid-cols-4">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 + 0.12 }}
          className="glass-panel p-6"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <feature.icon className="h-5 w-5" />
          </div>
          <h3 className="headline mt-5 text-xl font-semibold">{feature.title}</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.description}</p>
        </motion.div>
      ))}
    </section>

    <section id="teams" className="glass-panel p-6">
      <div className="grid gap-5 md:grid-cols-3">
        {[
          ["Team codes", "Admins generate readable codes like TEAM-X92A for member signup."],
          ["Workspace security", "Projects and tasks stay filtered to the active workspace session."],
          ["Flexible admin flow", "Admins can create, switch, and manage multiple workspaces from one account."]
        ].map(([title, description]) => (
          <div key={title} className="surface-panel p-5">
            <p className="font-semibold">{title}</p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </section>

    <section id="roles" className="grid gap-6 py-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h3 className="headline text-2xl font-semibold">Role-based access</h3>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="surface-panel p-5">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Admin</p>
            <p className="mt-3 font-semibold">Create projects, add members, assign tasks, and manage delivery.</p>
          </div>
          <div className="surface-panel p-5">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Member</p>
            <p className="mt-3 font-semibold">View assigned work, move tasks, comment, and keep execution updated.</p>
          </div>
        </div>
      </div>

      <div id="profile" className="glass-panel p-6">
        <div className="flex items-center gap-3">
          <UserRound className="h-5 w-5 text-primary" />
          <h3 className="headline text-2xl font-semibold">Profile updates</h3>
        </div>
        <div className="mt-5 space-y-4">
          {[
            "Upload avatars with Cloudinary.",
            "Edit name, bio, and location anytime.",
            "Keep email fixed as the account identifier."
          ].map((item) => (
            <div key={item} className="surface-panel p-4 text-sm text-muted-foreground">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
)

export default LandingPage
