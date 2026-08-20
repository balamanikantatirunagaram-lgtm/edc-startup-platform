"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon,
  RocketIcon,
  BellIcon,
  UserIcon,
  SettingsIcon,
  UsersIcon,
  ClipboardListIcon,
  ShieldCheckIcon,
  CalendarIcon,
  BanknoteIcon,
  BriefcaseIcon,
  FileTextIcon,
  BookOpenIcon,
  BuildingIcon,
  GlobeIcon,
  TrophyIcon,
  LogOutIcon,
  CheckCircle2Icon
} from "lucide-react"

import { Brand } from "@/components/layout/Brand"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { useEffect, useState } from "react"
import { getMyTeamStatus } from "@/services/team.service"
import { useAppState } from "@/lib/app-state-context"
import { logout } from "@/services/auth.service"
import { Button } from "@/components/ui/button"

const baseStudentNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Mentor Connect", href: "/mentors", icon: BriefcaseIcon },
  { title: "Learning Hub", href: "/learning", icon: BookOpenIcon },
  { title: "Document Center", href: "/documents", icon: FileTextIcon },
  { title: "Resources", href: "/resources", icon: ClipboardListIcon },
  { title: "Internships & Jobs", href: "/jobs", icon: BriefcaseIcon },
  { title: "Funding", href: "/funding", icon: BanknoteIcon },
  { title: "Events", href: "/events", icon: CalendarIcon },
  { title: "Viksit Bharat", href: "/viksit-bharat", icon: GlobeIcon },
  { title: "Profile", href: "/profile", icon: UserIcon },
  { title: "Settings", href: "/settings", icon: SettingsIcon },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { currentUser } = useAppState()
  const isAdmin = currentUser?.role === "admin"

  const [navItems, setNavItems] = useState<any[]>(baseStudentNav)

  useEffect(() => {
    getMyTeamStatus().then(status => {
      let finalNav = [...baseStudentNav]
      
      if (status.startupStatus === 'Incubation Ready') {
        // Insert Incubator Connect after My Applications
        const appIndex = finalNav.findIndex(i => i.title === "My Applications")
        if (appIndex !== -1) {
          finalNav.splice(appIndex + 1, 0, { title: "Incubator Connect", href: "/incubators", icon: BuildingIcon })
        }
      }

      if (status.hasTeam) {
        setNavItems([
          finalNav[0],
          { title: "My Startup", href: "/startup", icon: RocketIcon },
          ...finalNav.slice(1)
        ])
      } else {
        setNavItems([
          finalNav[0],
          { title: "Register Startup", href: "/startup/register", icon: RocketIcon },
          { title: "Team Connect", href: "/team", icon: UsersIcon },
          ...finalNav.slice(1)
        ])
      }
    })
  }, [])

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href)

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard">
          <Brand />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Student</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                    render={
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Only show admin switch if user has admin role */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Switch View</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Admin view"
                    render={
                      <Link href="/admin">
                        <ShieldCheckIcon />
                        <span>Admin view</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors h-10 px-3 rounded-lg text-sm font-medium"
          onClick={async () => {
            localStorage.removeItem("edc_user")
            localStorage.removeItem("edc_startup")
            localStorage.removeItem("edc_notifications")
            await logout()
            window.location.href = '/login'
          }}
        >
          <LogOutIcon className="size-4" />
          <span>Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
