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
  GlobeIcon,
  BookOpenIcon,
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
import { LogOutIcon, GraduationCapIcon } from "lucide-react"
import {
  STUDENT_PORTAL_URL,
  ADMIN_PORTAL_URL,
} from "@/config/portal-urls"

const mentorNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Network", href: "/network", icon: UsersIcon },
  { title: "Learning Hub", href: "/learning", icon: BookOpenIcon },
  { title: "Resources", href: "/resources", icon: FileTextIcon },
  { title: "Funding Apps", href: "/applications", icon: BanknoteIcon },
  { title: "Meetings", href: "/meetings", icon: CalendarIcon },
  { title: "Mentoring Requests", href: "/requests", icon: BriefcaseIcon },
  { title: "My Startups", href: "/startups", icon: RocketIcon },
  { title: "Document Center", href: "/documents", icon: FileTextIcon },
  { title: "Job Board", href: "/jobs", icon: BriefcaseIcon },
  { title: "Viksit Bharat", href: "/viksit-bharat", icon: GlobeIcon },
  { title: "Messages", href: "/messages", icon: BellIcon },
  { title: "Profile", href: "/profile", icon: UserIcon },
  { title: "Settings", href: "/settings", icon: SettingsIcon },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { currentUser } = useAppState()
  const navItems = mentorNav

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
          <SidebarGroupLabel>Mentor</SidebarGroupLabel>
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

        {/* Cross-portal navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Portals</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Student Portal"
                  render={
                    <a href={STUDENT_PORTAL_URL} target="_blank" rel="noopener noreferrer">
                      <GraduationCapIcon />
                      <span>Student Portal</span>
                    </a>
                  }
                />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Admin Portal"
                  render={
                    <a href={ADMIN_PORTAL_URL} target="_blank" rel="noopener noreferrer">
                      <ShieldCheckIcon />
                      <span>Admin Portal</span>
                    </a>
                  }
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


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
