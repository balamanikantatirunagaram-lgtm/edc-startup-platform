"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { logout, getCurrentUser } from "@/services/auth.service"
import { getMyNotifications } from "@/services/notifications.service"
import { BellIcon, LogOutIcon, UserIcon, SettingsIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/shared/ModeToggle"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAppState } from "@/lib/app-state-context"
import { STUDENT_PORTAL_URL, ADMIN_PORTAL_URL } from "@/config/portal-urls"
import { ExternalLinkIcon } from "lucide-react"

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/network": "Network",
  "/learning": "Learning Hub",
  "/resources": "Resources",
  "/applications": "Funding Applications",
  "/meetings": "Meetings",
  "/requests": "Mentoring Requests",
  "/startups": "My Startups",
  "/documents": "Document Center",
  "/jobs": "Job Board",
  "/viksit-bharat": "Viksit Bharat",
  "/messages": "Messages",
  "/notifications": "Notifications",
  "/profile": "Profile",
  "/settings": "Settings",
}

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser: mockUser, notifications: mockNotifications } = useAppState()

  const [realUser, setRealUser] = useState<{ name: string; niatId: string; avatarUrl: string } | null>(null)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (u) setRealUser({ name: u.name || u.email, niatId: u.niatId, avatarUrl: (u as any).avatarUrl || "" })
    })
    getMyNotifications().then((res) => {
      if (res.notifications) setUnread(res.notifications.filter((n: any) => !n.read).length)
    })
  }, [])

  const title = TITLES[pathname] ?? "EDC Cell"

  const displayName = realUser?.name || mockUser?.fullName || ""
  const displayId = realUser?.niatId || mockUser?.niatId || ""
  const avatarUrl = realUser?.avatarUrl || mockUser?.avatarUrl || ""
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <h1 className="text-sm font-semibold tracking-tight md:text-base">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative"
          nativeButton={false}
          render={<Link href="/notifications" />}
        >
          <BellIcon />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
          )}
        </Button>
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="gap-2 pl-1.5 pr-2.5">
                <Avatar className="size-7">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">
                  {displayName}
                </span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {displayName}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  @{displayId}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <UserIcon />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <SettingsIcon />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => window.open(STUDENT_PORTAL_URL, "_blank")}>
                <ExternalLinkIcon />
                Student Portal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(ADMIN_PORTAL_URL, "_blank")}>
                <ExternalLinkIcon />
                Admin Portal
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={async () => {
                localStorage.removeItem("edc_user")
                localStorage.removeItem("edc_startup")
                localStorage.removeItem("edc_notifications")
                await logout()
                window.location.href = '/login'
              }}
            >
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
