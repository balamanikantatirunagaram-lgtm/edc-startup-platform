"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
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
  const { currentUser, notifications } = useAppState()

  const title = TITLES[pathname] ?? "EDC Cell"

  const unread = notifications.filter((n) => !n.read).length
  const initials = currentUser.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")

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
                  <AvatarImage src={currentUser.avatarUrl} alt={currentUser.fullName} />
                  <AvatarFallback className="text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">
                  {currentUser.fullName}
                </span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {currentUser.fullName}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {currentUser.niatId}
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
            <DropdownMenuItem
              variant="destructive"
              onClick={() => router.push("/login")}
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
