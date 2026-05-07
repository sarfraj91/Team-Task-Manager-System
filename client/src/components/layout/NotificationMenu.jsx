import { Bell, FolderKanban, SquareCheckBig } from "lucide-react"
import { useEffect, useState } from "react"
import { getDashboardOverview } from "@/api/dashboard"
import { Avatar } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/utils"

const NotificationMenu = () => {
  const [items, setItems] = useState([])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const overview = await getDashboardOverview()
        setItems(overview.recentActivity.slice(0, 6))
      } catch (_error) {
        setItems([])
      }
    }

    fetchNotifications()
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {items.length ? <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-cyan-400" /> : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[340px]">
        <DropdownMenuLabel>Recent activity</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[360px] space-y-1 overflow-y-auto premium-scrollbar">
          {items.length ? (
            items.map((item) => (
              <DropdownMenuItem key={item.id} className="items-start gap-3">
                <Avatar src={item.actor?.avatar} alt={item.actor?.name || item.title} className="h-10 w-10 rounded-xl" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {item.source === "task" ? <SquareCheckBig className="h-3.5 w-3.5" /> : <FolderKanban className="h-3.5 w-3.5" />}
                    {formatRelativeTime(item.createdAt)}
                  </div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{item.message}</p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-3 py-10 text-center text-sm text-muted-foreground">
              No notifications yet. Activity from projects and tasks will appear here.
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationMenu

