"use client"

import * as React from "react"
import Link from "next/link"
import {
  UsersIcon,
  RocketIcon,
  ClockIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
  ActivityIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { getAdminStats, getAllStartups } from "@/services/admin.service"

export default function AdminOverviewPage() {
  const [stats, setStats] = React.useState({ totalStudents: 0, totalStartups: 0, pendingReviews: 0 })
  const [startups, setStartups] = React.useState<any[]>([])
  
  React.useEffect(() => {
    async function load() {
      const [s, list] = await Promise.all([
        getAdminStats(),
        getAllStartups()
      ])
      setStats(s)
      setStartups(list)
    }
    load()
  }, [])

  const pendingStartups = startups.filter(
    (s) => s.status === "pending" || s.status === "Under Review" || !s.status
  )

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">Monitor and manage student incubation applications.</p>
      </section>

      {/* Metrics Section */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Registered Students"
          value={stats.totalStudents}
          icon={UsersIcon}
          hint="Active founders"
        />
        <StatCard
          label="Total Startups"
          value={stats.totalStartups}
          icon={RocketIcon}
          hint="Incubation applications"
        />
        <StatCard
          label="Pending Reviews"
          value={stats.pendingReviews}
          icon={ClockIcon}
          hint="Action required"
        />
        <StatCard
          label="Approved / Ready"
          value={stats.totalStartups - stats.pendingReviews}
          icon={CheckCircle2Icon}
          hint="Successfully validated"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Reviews List */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Pending Applications</CardTitle>
                <CardDescription>Startups waiting for review or feedback.</CardDescription>
              </div>
              <Button render={<Link href="/admin/startups" />} variant="outline" size="sm">
                All Startups
                <ArrowRightIcon className="size-3.5 ml-1 inline" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {pendingStartups.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground italic text-sm">
                  No pending applications.
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {pendingStartups.slice(0, 5).map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                      <div className="flex flex-col gap-1 max-w-[70%]">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{s.name}</span>
                          <StatusBadge status={s.status || 'pending'} />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Team: {s.teams?.name || 'Unknown'} · {s.industry || s.category}
                        </span>
                      </div>
                      <Button render={<Link href={`/admin/startups/${s.id}`} />} size="sm" variant="ghost">
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ActivityIcon className="size-4 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest actions on the platform.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col gap-4 p-5 text-sm text-muted-foreground italic">
                Activity feed coming soon based on real event logs.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
