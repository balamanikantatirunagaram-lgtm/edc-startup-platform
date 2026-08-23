"use client"

import React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
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
import { MENTOR_PORTAL_URL, ADMIN_PORTAL_URL } from "@/config/portal-urls"
import { ExternalLinkIcon } from "lucide-react"

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/startup": "My Startup",
  "/startup/register": "Register Startup",
  "/startup/team": "My Team",
  "/notifications": "Notifications",
  "/profile": "Profile",
  "/settings": "Settings",
  "/onboarding": "Complete your profile",
  "/mentors": "Mentor Connect",
  "/resources": "Resources",
  "/funding": "Funding",
  "/events": "Events",
  "/team": "Team Connect",
}

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [unread, setUnread] = React.useState(0)
  const [me, setMe] = React.useState<{ name?: string; avatarUrl?: string; niatId?: string } | null>(null)

  // Real session identity for the header (mock store is never populated)
  React.useEffect(() => {
    let active = true
    getCurrentUser()
      .then((r) => { if (active && r && (r.name || r.niatId)) setMe(r) })
      .catch(() => {})
    return () => { active = false }
  }, [pathname])

  // Real unread count from the notifications table
  React.useEffect(() => {
    let active = true
    const loadUnread = async () => {
      try {
        const res = await getMyNotifications()
        if (!active) return
        setUnread((res.notifications || []).filter((n: any) => !n.read).length)
      } catch { /* logged out — badge stays hidden */ }
    }
    loadUnread()
    const interval = setInterval(loadUnread, 60000)
    return () => { active = false; clearInterval(interval) }
  }, [pathname])

  const title = TITLES[pathname] ?? "EDC Cell"

  const fullName = me?.name || ""
  const avatarSrc = me?.avatarUrl || ""
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

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
                  <AvatarImage src={avatarSrc} alt={fullName} />
                  <AvatarFallback className="text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">
                  {fullName}
                </span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {fullName}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {me?.niatId || ""}
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
            {(me as any)?.role === "admin" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => window.open(ADMIN_PORTAL_URL, "_blank")}>
                    <ExternalLinkIcon />
                    Admin Portal
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => window.open(MENTOR_PORTAL_URL, "_blank")}>
                <ExternalLinkIcon />
                Mentor Portal
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
