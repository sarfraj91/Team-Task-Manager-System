import { Check, Copy, Mail, MapPin, ShieldCheck, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { getTeamMembers } from "@/api/users"
import { getCurrentWorkspace } from "@/api/workspaces"
import EmptyState from "@/components/common/EmptyState"
import PageHeader from "@/components/common/PageHeader"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/useAuth"

const MembersPage = () => {
  const { currentWorkspace, isAdmin } = useAuth()
  const [workspace, setWorkspace] = useState(currentWorkspace)
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [memberData, workspaceData] = await Promise.all([getTeamMembers(), getCurrentWorkspace()])
      setMembers(memberData)
      setWorkspace(workspaceData)
    } catch (_error) {
      toast.error("Unable to load workspace members")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentWorkspace?._id])

  const summary = useMemo(
    () => ({
      total: members.length,
      admins: members.filter((member) => member.role === "admin").length,
      members: members.filter((member) => member.role === "member").length
    }),
    [members]
  )

  const copyTeamCode = async () => {
    if (!workspace?.teamCode) {
      return
    }

    try {
      await navigator.clipboard.writeText(workspace.teamCode)
      setCopied(true)
      toast.success("Team code copied")
      window.setTimeout(() => setCopied(false), 1800)
    } catch (_error) {
      toast.error("Unable to copy the team code")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-36 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Members"
        title="People inside the active workspace."
        description="See who belongs to this workspace, which role they hold, and share the team code for new member signup."
        extra={
          workspace?.teamCode ? (
            <Button variant="secondary" onClick={copyTeamCode}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              Copy team code
            </Button>
          ) : null
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        {[
          ["Total people", summary.total],
          ["Admins", summary.admins],
          ["Members", summary.members]
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="headline mt-3 text-4xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Workspace join code</CardTitle>
            <CardDescription>Members use this during signup to join the correct team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="surface-panel p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current workspace</p>
              <p className="mt-2 text-2xl font-semibold">{workspace?.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Team code: <span className="font-semibold text-foreground">{workspace?.teamCode}</span>
              </p>
            </div>
            <div className="rounded-[28px] border border-primary/20 bg-primary/10 p-5">
              <p className="font-semibold">{isAdmin ? "Invite flow" : "How your team grows"}</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {isAdmin
                  ? "Share this code with new members. They sign up as member, enter the code, verify the OTP, and the backend adds them to this workspace only."
                  : "New members join by entering this team code during signup, then confirming their email OTP before access is granted."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Member directory</CardTitle>
            <CardDescription>Everyone who can access the current workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {members.length ? (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member._id}
                    className="surface-panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={member.avatar} alt={member.name} className="h-12 w-12 rounded-2xl" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{member.name}</p>
                          <Badge>{member.role}</Badge>
                        </div>
                        <div className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap">
                          <span className="inline-flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {member.email}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {member.location || "Location not added"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Joined {new Date(member.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="No members found"
                description="Once people join this workspace using the team code, they will appear here."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MembersPage
