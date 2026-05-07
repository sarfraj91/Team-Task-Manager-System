import { useState } from "react"
import { Outlet } from "react-router-dom"
import AppSidebar from "@/components/layout/AppSidebar"
import TopNavbar from "@/components/layout/TopNavbar"

const AppShell = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopNavbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 pb-10 pt-2">
          <div className="mx-auto w-full max-w-[1440px] space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppShell
