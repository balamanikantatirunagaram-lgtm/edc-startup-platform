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
  GraduationCapIcon,
  CalendarIcon,
  BanknoteIcon,
  BriefcaseIcon,
} from "lucide-react"

import { Brand } from "@/components/brand"
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
import { getMyTeamStatus } from "@/app/actions/team"
import { logout } from "@/app/actions/auth"

const baseStudentNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Mentor Connect", href: "/mentors", icon: BriefcaseIcon },
  { title: "Resources", href: "/resources", icon: ClipboardListIcon },
  { title: "Funding", href: "/funding", icon: BanknoteIcon },
  { title: "Events", href: "/events", icon: CalendarIcon },
  { title: "Profile", href: "/profile", icon: UserIcon },
  { title: "Settings", href: "/settings", icon: SettingsIcon },
]

const adminNav = [
  { title: "Overview", href: "/admin", icon: LayoutDashboardIcon },
  { title: "Students", href: "/admin/students", icon: UsersIcon },
  { title: "Startups", href: "/admin/startups", icon: ClipboardListIcon },
]

export function AppSidebar() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")

  const [navItems, setNavItems] = useState<any[]>(baseStudentNav)

  useEffect(() => {
    if (!isAdmin) {
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
    }
  }, [isAdmin])

  const isActive = (href: string) =>
    href === "/admin" || href === "/dashboard"
      ? pathname === href
      : pathname.startsWith(href)

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href={isAdmin ? "/admin" : "/dashboard"}>
          <Brand />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {isAdmin ? "Administration" : "Student"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(isAdmin ? adminNav : navItems).map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel>Switch view</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={isAdmin ? "Student view" : "Admin view"}
                  render={
                    <Link href={isAdmin ? "/dashboard" : "/admin"}>
                      {isAdmin ? <GraduationCapIcon /> : <ShieldCheckIcon />}
                      <span>
                        {isAdmin ? "Student view" : "Admin view"}
                      </span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <div className="flex flex-col gap-2">
          <button 
            onClick={async () => {
              await logout();
              window.location.href = '/login';
            }}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium px-3 py-2 rounded-md hover:bg-red-50 transition-colors w-full text-left"
          >
            Sign out
          </button>
          <div className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">EDC Cell · v1</p>
            <p className="mt-0.5">MVP preview — demo data only.</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
