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
