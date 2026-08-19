"use client"

import * as React from "react"
import Link from "next/link"
import {
  BellIcon,
  BriefcaseIcon,
  MessageSquareIcon,
  RocketIcon,
  UsersIcon,
  CheckCircle2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"

import { getMentorDashboardData } from "@/services/mentorship.service"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<any>(null)

  React.useEffect(() => {
    async function load() {
      const res = await getMentorDashboardData()
      if (res.error) {
        toast.error(res.error)
      } else {
        setData(res)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading || !data) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  const { stats, recentStartups, pendingRequests } = data

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          Mentor Dashboard
        </h1>
        <p className="text-sm text-muted-foreground text-pretty">
          Welcome to your EDC Mentor Portal. Here's an overview of your activity.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Startups" value={stats.activeStartups} icon={RocketIcon} hint="Currently mentoring" />
        <StatCard label="Pending Requests" value={stats.pendingRequests} icon={BriefcaseIcon} hint="Awaiting review" />
        <StatCard label="Unread Messages" value={stats.unreadMessages} icon={MessageSquareIcon} hint="From founders" />
        <StatCard label="Total Meetings" value={stats.totalMeetings} icon={UsersIcon} hint="This semester" />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Startups Under Mentorship</CardTitle>
                <CardDescription>Startups you are actively guiding.</CardDescription>
              </div>
              <Button render={<Link href="/startups" />} nativeButton={false} variant="outline" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {recentStartups.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                        <RocketIcon className="size-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">{s.name}</span>
                        <span className="text-xs text-muted-foreground">{s.industry} • {s.stage}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Manage</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Messages</CardTitle>
                <CardDescription>Latest communications from your teams.</CardDescription>
              </div>
              <Button render={<Link href="/messages" />} nativeButton={false} variant="outline" size="sm">
                Open Inbox
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-primary" />
                  <span className="font-medium text-foreground">EcoTrack:</span>
                  <span className="truncate">"Can we review the pitch deck tomorrow?"</span>
                </div>
                <div className="flex items-center gap-3 opacity-60">
                  <span className="size-2 rounded-full bg-muted-foreground" />
                  <span className="font-medium text-foreground">HealthAI:</span>
                  <span className="truncate">"Thanks for the feedback on our architecture!"</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending Requests</CardTitle>
              <CardDescription>Teams asking for your mentorship.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {pendingRequests.map((req: any) => (
                <div key={req.id} className="flex flex-col gap-2 rounded-md border p-3">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{req.teamName}</span>
                    <span className="text-xs text-muted-foreground">{req.date}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Topic: {req.topic}</span>
                  <div className="flex gap-2 mt-1">
                    <Button size="sm" className="w-full h-7 text-xs">Accept</Button>
                    <Button size="sm" variant="outline" className="w-full h-7 text-xs">Decline</Button>
                  </div>
                </div>
              ))}
              <Button render={<Link href="/requests" />} nativeButton={false} variant="ghost" className="w-full text-xs">
                View all requests
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
