import { ShieldX } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import EmptyState from "@/components/common/EmptyState"

const UnauthorizedPage = () => {
  const navigate = useNavigate()

  return (
    <div className="container flex min-h-screen items-center justify-center py-10">
      <div className="w-full max-w-2xl">
        <EmptyState
          icon={ShieldX}
          title="You don’t have access to this area"
          description="Your current role does not include permission for the page or action you tried to open."
          actionLabel="Go to dashboard"
          onAction={() => navigate("/app/dashboard")}
        />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Need a safer route? <Link className="text-cyan-300" to="/app/dashboard">Return to the dashboard</Link>.
        </p>
      </div>
    </div>
  )
}

export default UnauthorizedPage
