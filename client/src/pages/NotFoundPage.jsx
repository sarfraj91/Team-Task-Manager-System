import { Compass } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import EmptyState from "@/components/common/EmptyState"

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="container flex min-h-screen items-center justify-center py-10">
      <div className="w-full max-w-2xl">
        <EmptyState
          icon={Compass}
          title="Page not found"
          description="The route you’re looking for doesn’t exist in this workspace build."
          actionLabel="Back to home"
          onAction={() => navigate("/")}
        />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Head back to <Link className="text-cyan-300" to="/">the landing page</Link>.
        </p>
      </div>
    </div>
  )
}

export default NotFoundPage
