import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { AdminHeader } from "@/components/layout/AdminHeader"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getCurrentUser } from "@/services/auth.service"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <div className="flex-1 p-4 md:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
