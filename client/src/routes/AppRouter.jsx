import { Suspense, lazy } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import AppShell from "@/layouts/AppShell"
import AuthShell from "@/layouts/AuthShell"
import ProtectedRoute from "./ProtectedRoute"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/useAuth"

const LandingPage = lazy(() => import("@/pages/LandingPage"))
const LoginPage = lazy(() => import("@/pages/LoginPage"))
const RegisterPage = lazy(() => import("@/pages/RegisterPage"))
const DashboardPage = lazy(() => import("@/pages/DashboardPage"))
const ProjectsPage = lazy(() => import("@/pages/ProjectsPage"))
const ProjectDetailsPage = lazy(() => import("@/pages/ProjectDetailsPage"))
const TasksPage = lazy(() => import("@/pages/TasksPage"))
const ActivityPage = lazy(() => import("@/pages/ActivityPage"))
const MembersPage = lazy(() => import("@/pages/MembersPage"))
const SettingsPage = lazy(() => import("@/pages/SettingsPage"))
const UnauthorizedPage = lazy(() => import("@/pages/UnauthorizedPage"))
const WorkspacePage = lazy(() => import("@/pages/WorkspacePage"))
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"))

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center p-6">
    <div className="glass-panel w-full max-w-2xl space-y-4 p-8">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
  </div>
)

const RootRedirect = () => {
  const { isAuthenticated } = useAuth()
  return <Navigate to={isAuthenticated ? "/app/dashboard" : "/"} replace />
}

const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AuthShell />}>
          <Route index element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>

        <Route path="/home" element={<RootRedirect />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="workspace" element={<WorkspacePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
)

export default AppRouter
