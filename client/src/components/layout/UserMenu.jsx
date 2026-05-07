import { Building2, ChevronDown, LogOut, Shield, UserCircle2, Users } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"

const UserMenu = () => {
  const { currentWorkspace, logout, user } = useAuth()
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="h-11 rounded-2xl px-3">
          <Avatar src={user?.avatar} alt={user?.name} className="h-8 w-8 rounded-xl" />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Workspace account</DropdownMenuLabel>
        {currentWorkspace ? (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-2">
              <p className="text-sm font-semibold">{currentWorkspace.name}</p>
              <p className="text-xs text-muted-foreground">{currentWorkspace.teamCode}</p>
            </div>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/app/settings")}>
          <UserCircle2 className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/app/members")}>
          <Users className="mr-2 h-4 w-4" />
          Members
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/app/workspace")}>
          <Building2 className="mr-2 h-4 w-4" />
          Workspace
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Shield className="mr-2 h-4 w-4" />
          Role: {user?.role}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await logout()
            navigate("/login")
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserMenu
