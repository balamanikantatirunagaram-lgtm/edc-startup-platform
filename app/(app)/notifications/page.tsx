"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  BellIcon,
  CheckCheckIcon,
  MessageSquareIcon,
  RocketIcon,
  UserIcon,
  FileTextIcon,
  Trash2Icon,
  UsersIcon
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppState } from "@/lib/app-state-context"
import { getMyInvitations, respondToInvitation } from "@/app/actions/team"

export default function NotificationsPage() {
  const {
    notifications,
    markAllNotificationsRead,
    toggleNotificationRead,
    deleteNotification,
  } = useAppState()
  
  const [invitations, setInvitations] = useState<any[]>([])

  useEffect(() => {
    getMyInvitations().then(res => {
      if (res.invitations) {
        setInvitations(res.invitations)
      }
    })
  }, [])

  const handleMarkAllRead = () => {
    markAllNotificationsRead()
    toast.success("All notifications marked as read.")
  }

  const handleToggleRead = (id: string) => {
    toggleNotificationRead(id)
  }

  const handleDelete = (id: string) => {
    deleteNotification(id)
    toast.success("Notification removed.")
  }
  
  const handleInviteAction = async (id: string, status: 'approved' | 'rejected') => {
    toast.info("Processing...")
    const res = await respondToInvitation(id, status)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(`Invitation ${status}!`)
      setInvitations(prev => prev.filter(inv => inv.id !== id))
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "feedback":
        return <MessageSquareIcon className="size-4 text-blue-500" />
      case "approved":
        return <RocketIcon className="size-4 text-green-500 animate-bounce" />
      case "profile":
        return <UserIcon className="size-4 text-orange-500" />
      default:
        return <FileTextIcon className="size-4 text-primary" />
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <BellIcon className="size-5 text-primary" />
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground">Stay updated on your startup review status and team invites.</p>
        </div>
        <Button onClick={handleMarkAllRead} variant="outline" size="sm" className="gap-1.5 self-start">
          <CheckCheckIcon className="size-4" />
          Mark all as read
        </Button>
      </section>
      
      {invitations.length > 0 && (
        <Card className="border-primary/50">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-base flex items-center gap-2">
              <UsersIcon className="size-5" />
              Team Invitations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {invitations.map(inv => (
                <div key={inv.id} className="flex flex-col gap-3 p-4">
                  <div>
                    <span className="text-sm font-semibold text-foreground">You have been invited to join team: {inv.teamName}</span>
                    <p className="text-xs text-muted-foreground mt-1">Requested on {new Date(inv.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleInviteAction(inv.id, 'approved')}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => handleInviteAction(inv.id, 'rejected')}>Decline</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
                <BellIcon className="size-6" />
              </div>
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-0.5">You have no new notifications.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 p-4 transition-colors hover:bg-muted/10 ${
                    !n.read ? "bg-primary/5 dark:bg-primary/5" : ""
                  }`}
                >
                  <div className="mt-1 size-8 rounded-full border bg-background flex items-center justify-center shadow-xs">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-semibold truncate ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {n.title}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">{n.createdAt}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed text-pretty">
                      {n.message}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <button
                        onClick={() => handleToggleRead(n.id)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        {n.read ? "Mark as unread" : "Mark as read"}
                      </button>
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="text-xs font-semibold text-destructive hover:underline flex items-center gap-1"
                      >
                        <Trash2Icon className="size-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
