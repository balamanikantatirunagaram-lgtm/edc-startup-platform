import type { ReactNode } from "react"

import { AppSidebar } from "@/components/layout/AppSidebar"
import { AppHeader } from "@/components/layout/AppHeader"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ChatBot } from "@/components/shared/ChatBot"

import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { ENV } from "@/config/env.config"

export default async function AppLayout({ children }: { children: ReactNode }) {
  // Check for suspension status
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  
  if (token) {
    const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
    const { data: authData, error } = await supabase.auth.getUser(token)
    if (error || !authData?.user) {
      redirect('/login')
    }

    // Check suspension status from the students table
    const { data: student } = await supabase
      .from('students')
      .select('is_suspended')
      .eq('id', authData.user.id)
      .single()

    if (student?.is_suspended) {
      redirect('/suspended')
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="flex-1 p-4 md:p-6 lg:p-8">{children}</div>
      </SidebarInset>
      <ChatBot />
    </SidebarProvider>
  )
}
