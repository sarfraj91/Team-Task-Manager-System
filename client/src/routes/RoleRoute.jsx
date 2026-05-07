import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

const RoleRoute = ({ allow = [] }) => {
  const { user } = useAuth()

  if (!allow.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export default RoleRoute

