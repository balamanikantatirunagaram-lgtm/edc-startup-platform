"use client"

import React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { LogOutIcon, ShieldCheckIcon } from "lucide-react"

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
import { logout, getCurrentUser } from "@/services/auth.service"
import { STUDENT_PORTAL_URL } from "@/config/portal-urls"
import { Badge } from "@/components/ui/badge"

const TITLES: Record<string, string> = {
  "/admin": "Admin Overview",
  "/admin/students": "Students",
  "/admin/startups": "Startup Applications",
}

export function AdminHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [me, setMe] = React.useState<{ name?: string; niatId?: string } | null>(null)

  React.useEffect(() => {
    let active = true
    getCurrentUser().then((u) => { if (active && u) setMe(u) }).catch(() => {})
    return () => { active = false }
  }, [])

  const fullName = me?.name || "Admin"

  const title =
    TITLES[pathname] ??
    (pathname.startsWith("/admin/startups/") ? "Startup Review" : "Admin Panel")

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
      <div className="flex items-center gap-2">
        <ShieldCheckIcon className="size-4 text-primary" />
        <h1 className="text-sm font-semibold tracking-tight md:text-base">
          {title}
        </h1>
      </div>

      <Badge variant="secondary" className="ml-1 text-xs hidden sm:inline-flex">
        Admin
      </Badge>

      <div className="ml-auto flex items-center gap-1">
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="gap-2 pl-1.5 pr-2.5">
                <Avatar className="size-7">
                  <AvatarImage src="" alt={fullName} />
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
                  {me?.niatId || "Admin"} · Admin
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => window.open(STUDENT_PORTAL_URL, "_blank")}>
                Switch to Student Portal
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={async () => {
                await logout()
                router.push("/login")
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
