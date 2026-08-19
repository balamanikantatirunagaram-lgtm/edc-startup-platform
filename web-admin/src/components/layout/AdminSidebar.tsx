"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon,
  UsersIcon,
  ClipboardListIcon,
  BriefcaseIcon,
  CalendarIcon,
  LibraryIcon,
  BanknoteIcon,
  GraduationCapIcon,
  ShieldCheckIcon,
  LogOutIcon,
  FileTextIcon,
  BuildingIcon,
  GlobeIcon,
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
import { logout } from "@/services/auth.service"

const adminNav = [
  { title: "Overview", href: "/admin", icon: LayoutDashboardIcon },
  { title: "Students", href: "/admin/students", icon: UsersIcon },
  { title: "Startups", href: "/admin/startups", icon: ClipboardListIcon },
  { title: "Events", href: "/admin/events", icon: CalendarIcon },
  { title: "Learning Hub", href: "/admin/learning-hub", icon: GraduationCapIcon },
  { title: "Resources", href: "/admin/resources", icon: LibraryIcon },
  { title: "Mentors", href: "/admin/mentors", icon: UsersIcon },
  { title: "Mentorships", href: "/admin/mentorships", icon: GraduationCapIcon },
  { title: "Funding", href: "/admin/funding", icon: BanknoteIcon },
  { title: "Network", href: "/admin/network", icon: UsersIcon },
  { title: "Document Center", href: "/admin/documents", icon: FileTextIcon },
  { title: "Incubators", href: "/admin/incubators", icon: BuildingIcon },
  { title: "Jobs", href: "/admin/jobs", icon: BriefcaseIcon },
  { title: "Viksit Bharat", href: "/admin/viksit-bharat", icon: GlobeIcon },
  { title: "Impact", href: "/admin/impact", icon: GlobeIcon },
  { title: "Gamification", href: "/admin/gamification", icon: ShieldCheckIcon },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href)

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/admin">
          <Brand />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-1.5">
            <ShieldCheckIcon className="size-3.5" />
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNav.map((item) => (
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
          <button
            onClick={async () => {
              await logout()
              window.location.href = "/login"
            }}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium px-3 py-2 rounded-md hover:bg-red-50 transition-colors w-full text-left"
          >
            <LogOutIcon className="size-4" />
            Sign out
          </button>
          <div className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">EDC Cell · Admin Panel</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
