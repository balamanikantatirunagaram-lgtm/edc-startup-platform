"use client"
import React, { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { getNotifications, markAsRead } from "@/services/notification.service"

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  
  useEffect(() => {
    getNotifications().then(res => {
      if (res.notifications) setNotifications(res.notifications)
    })
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleRead = async (id: string) => {
    await markAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600"></span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-2 font-semibold">
          <span>Notifications</span>
          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{unreadCount} new</span>
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.map(n => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-3 cursor-default focus:bg-accent/50" onClick={() => !n.read && handleRead(n.id)}>
              <div className="flex items-start justify-between w-full">
                <span className={`text-sm ${!n.read ? "font-semibold" : ""}`}>
                  {n.type.replace('_', ' ')}
                </span>
                {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-1" />}
              </div>
              <span className="text-xs text-muted-foreground line-clamp-2">
                {n.payload?.message || JSON.stringify(n.payload)}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
