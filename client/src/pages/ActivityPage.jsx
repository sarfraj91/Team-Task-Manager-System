import { Activity } from "lucide-react"
import { useEffect, useState } from "react"
import { getDashboardOverview } from "@/api/dashboard"
import EmptyState from "@/components/common/EmptyState"
import PageHeader from "@/components/common/PageHeader"
import { Avatar } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelativeTime } from "@/lib/utils"

const ActivityPage = () => {
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
    return <Skeleton className="h-[520px] w-full" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Activity feed"
        title="A clean timeline for team momentum, decisions, and delivery shifts."
        description="See what changed, who moved it, and where the execution story is heading."
      />

      {overview?.recentActivity?.length ? (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader>
              <CardTitle>Workspace timeline</CardTitle>
              <CardDescription>Recent actions across projects and tasks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {overview.recentActivity.map((entry) => (
                <div key={entry.id} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Avatar src={entry.actor?.avatar} alt={entry.actor?.name || entry.title} />
                  <div className="space-y-1">
                    <p className="font-semibold">{entry.title}</p>
                    <p className="text-sm text-muted-foreground">{entry.message}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {formatRelativeTime(entry.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team pulse</CardTitle>
              <CardDescription>People with visible task movement in the workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {overview.teamSnapshot.map((member) => (
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
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Once your team starts creating projects, moving tasks, and leaving comments, the timeline will populate here."
        />
      )}
    </div>
  )
}

export default ActivityPage
