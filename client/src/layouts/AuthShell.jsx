import { Outlet } from "react-router-dom"

const AuthShell = () => (
  <div className="relative min-h-screen overflow-hidden">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
    <div className="pointer-events-none absolute -left-20 top-12 h-80 w-80 rounded-full bg-primary/12 blur-3xl" />
    <div className="pointer-events-none absolute right-0 top-0 h-[26rem] w-[26rem] rounded-full bg-amber-400/10 blur-3xl" />
    <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
    <Outlet />
  </div>
)

export default AuthShell
