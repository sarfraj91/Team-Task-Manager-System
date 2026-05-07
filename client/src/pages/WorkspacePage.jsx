import { Building2, Check, Copy, FolderKanban, ListTodo, Plus, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { getCurrentWorkspace, getWorkspaces } from "@/api/workspaces"
import PageHeader from "@/components/common/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/useAuth"

const WorkspacePage = () => {
  const navigate = useNavigate()
  const { createWorkspace, currentWorkspace, isAdmin, switchWorkspace } = useAuth()
  const [workspace, setWorkspace] = useState(currentWorkspace)
  const [workspaces, setWorkspaces] = useState([])
  const [workspaceName, setWorkspaceName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [switchingWorkspaceId, setSwitchingWorkspaceId] = useState("")
  const [copied, setCopied] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [currentData, listData] = await Promise.all([getCurrentWorkspace(), getWorkspaces()])
      setWorkspace(currentData)
      setWorkspaces(listData)
    } catch (_error) {
      toast.error("Unable to load workspace details")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentWorkspace?._id])

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

  const handleCreateWorkspace = async (event) => {
    event.preventDefault()

    if (workspaceName.trim().length < 2) {
      toast.error("Workspace name must be at least 2 characters")
      return
    }

    setIsSubmitting(true)
    try {
      await createWorkspace({ name: workspaceName.trim() })
      setWorkspaceName("")
      navigate("/app/dashboard", { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create workspace")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSwitchWorkspace = async (workspaceId) => {
    if (!workspaceId || workspaceId === currentWorkspace?._id) {
      return
    }

    setSwitchingWorkspaceId(workspaceId)
    try {
      await switchWorkspace(workspaceId)
      navigate("/app/dashboard", { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to switch workspace")
    } finally {
      setSwitchingWorkspaceId("")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Skeleton className="h-[320px] w-full" />
          <Skeleton className="h-[320px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Manage your active team workspace."
        description="Keep team codes private, create new workspaces as admin, and switch between teams without mixing project data."
        extra={
          workspace?.teamCode ? (
            <Button variant="secondary" onClick={copyTeamCode}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {workspace.teamCode}
            </Button>
          ) : null
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Current workspace</CardTitle>
            <CardDescription>Everything in your session is filtered to this workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="surface-panel space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
                  <h2 className="headline mt-2 text-3xl font-semibold">{workspace?.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Team code: <span className="font-semibold text-foreground">{workspace?.teamCode}</span>
                  </p>
                </div>
                <Badge>{workspace?.isOwner ? "Owner" : "Member"}</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <Users className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">Members</p>
                  <p className="mt-2 text-2xl font-semibold">{workspace?.members?.length || 0}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <FolderKanban className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">Projects</p>
                  <p className="mt-2 text-2xl font-semibold">{workspace?.stats?.projectCount || 0}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <ListTodo className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">Tasks</p>
                  <p className="mt-2 text-2xl font-semibold">{workspace?.stats?.taskCount || 0}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-primary/20 bg-primary/10 p-5">
              <p className="text-sm font-semibold">How members join this workspace</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Share the team code with your members. During signup they choose the member role,
                enter this code, verify their email OTP, and they are added only to this workspace.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {isAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle>Create workspace</CardTitle>
                <CardDescription>Create another isolated team space from the same admin account.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateWorkspace} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workspace-name">Workspace name</Label>
                    <Input
                      id="workspace-name"
                      value={workspaceName}
                      onChange={(event) => setWorkspaceName(event.target.value)}
                      placeholder="Customer Success Team"
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    <Plus className="h-4 w-4" />
                    Create workspace
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Available workspaces</CardTitle>
              <CardDescription>Switch the active workspace to load its own members, projects, and tasks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {workspaces.map((item) => (
                <div
                  key={item._id}
                  className="surface-panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{item.name}</p>
                      {item.isActive ? <Badge>Active</Badge> : null}
                      {item.isOwner ? <Badge>Owner</Badge> : null}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.teamCode} • {item.memberCount} members • {item.projectCount} projects
                    </p>
                  </div>
                  <Button
                    variant={item.isActive ? "outline" : "secondary"}
                    disabled={item.isActive || switchingWorkspaceId === item._id}
                    onClick={() => handleSwitchWorkspace(item._id)}
                  >
                    <Building2 className="h-4 w-4" />
                    {item.isActive ? "Current workspace" : "Switch workspace"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default WorkspacePage
