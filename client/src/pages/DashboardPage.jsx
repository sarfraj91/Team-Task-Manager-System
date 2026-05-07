import { BriefcaseBusiness, CheckCircle2, Clock3, TriangleAlert } from "lucide-react"
import { useEffect, useState } from "react"
import { getDashboardOverview } from "@/api/dashboard"
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel"
import RecentActivityList from "@/components/dashboard/RecentActivityList"
import StatCard from "@/components/dashboard/StatCard"
import UpcomingTasksList from "@/components/dashboard/UpcomingTasksList"
import PageHeader from "@/components/common/PageHeader"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const DashboardPage = () => {
  const [overview, setOverview] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await getDashboardOverview()
        setOverview(response)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOverview()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
        <Skeleton className="h-[380px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace overview"
        title="Execution visibility that feels calm, not chaotic."
        description="Track team momentum, spot delivery risk early, and move straight from insight to action."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total projects"
          value={overview?.stats?.totalProjects || 0}
          hint="Cross-functional workspaces in motion"
          icon={BriefcaseBusiness}
        />
        <StatCard
          title="Completed tasks"
          value={overview?.stats?.completedTasks || 0}
          hint="Shipped work across all boards"
          icon={CheckCircle2}
          accent="from-emerald-500/20 to-teal-500/10"
        />
        <StatCard
          title="Pending tasks"
          value={overview?.stats?.pendingTasks || 0}
          hint="Open work still moving through the funnel"
          icon={Clock3}
          accent="from-amber-500/20 to-orange-500/10"
        />
        <StatCard
          title="Overdue tasks"
          value={overview?.stats?.overdueTasks || 0}
          hint="Items that need immediate attention"
          icon={TriangleAlert}
          accent="from-rose-500/20 to-pink-500/10"
        />
      </div>

      <AnalyticsPanel
        productivity={overview?.productivity}
        statusDistribution={overview?.statusDistribution}
        priorityDistribution={overview?.priorityDistribution}
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <RecentActivityList items={overview?.recentActivity || []} />
          <Card>
            <CardHeader>
              <CardTitle>Recent tasks</CardTitle>
              <CardDescription>Updated tasks across your accessible projects.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview?.recentTasks?.map((task) => (
                <div key={task._id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.project?.title}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge>{task.status}</Badge>
                    {task.assignedTo ? <Avatar src={task.assignedTo.avatar} alt={task.assignedTo.name} className="h-9 w-9 rounded-xl" /> : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <UpcomingTasksList items={overview?.upcomingTasks || []} />
          <Card>
            <CardHeader>
              <CardTitle>Team workload</CardTitle>
              <CardDescription>Open vs completed load by contributor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {overview?.teamSnapshot?.map((member) => (
                <div key={member.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={member.avatar} alt={member.name} className="h-10 w-10 rounded-xl" />
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.openTasks} open • {member.completedTasks} completed
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {!overview?.teamSnapshot?.length ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
                  Team workload will appear once tasks are assigned.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
