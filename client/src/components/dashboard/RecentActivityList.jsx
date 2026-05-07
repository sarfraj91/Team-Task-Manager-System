import { Avatar } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatRelativeTime } from "@/lib/utils"

const RecentActivityList = ({ items = [] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Activity timeline</CardTitle>
      <CardDescription>Recent project and task changes from your team.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <Avatar src={item.actor?.avatar} alt={item.actor?.name || item.title} className="h-11 w-11 rounded-xl" />
          <div className="space-y-1">
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="text-sm text-muted-foreground">{item.message}</p>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{formatRelativeTime(item.createdAt)}</p>
          </div>
        </div>
      ))}
      {!items.length ? <p className="text-sm text-muted-foreground">No recent activity yet.</p> : null}
    </CardContent>
  </Card>
)

export default RecentActivityList

