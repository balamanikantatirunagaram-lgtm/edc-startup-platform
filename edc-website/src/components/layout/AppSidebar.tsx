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
  BotIcon,
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

const baseStudentNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Mentor Connect", href: "/mentors", icon: BriefcaseIcon },
  { title: "Learning Hub", href: "/learning", icon: BookOpenIcon },
  { title: "Document Center", href: "/documents", icon: FileTextIcon },
  { title: "Resources", href: "/resources", icon: ClipboardListIcon },
  { title: "Internships & Jobs", href: "/jobs", icon: BriefcaseIcon },
  { title: "My Applications", href: "/applications", icon: CheckCircle2Icon },
  { title: "Incubator Connect", href: "/incubators", icon: BuildingIcon },
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
      if (status.hasTeam) {
        setNavItems([
          baseStudentNav[0],
          { title: "My Startup", href: "/startup", icon: RocketIcon },
          ...baseStudentNav.slice(1)
        ])
      } else {
        setNavItems([
          baseStudentNav[0],
          { title: "Register Startup", href: "/startup/register", icon: RocketIcon },
          { title: "Team Connect", href: "/team", icon: UsersIcon },
          ...baseStudentNav.slice(1)
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
        <div className="flex flex-col gap-2">
          <div className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">EDC Cell · v1</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
