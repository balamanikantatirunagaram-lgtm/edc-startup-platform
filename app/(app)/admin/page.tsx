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
  MessageSquareIcon,
  AlertTriangleIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { adminMetrics, activityLogs, adminStartups } from "@/lib/mock-data"

export default function AdminOverviewPage() {
  const pendingStartups = adminStartups.filter(
    (s) => s.status === "Submitted" || s.status === "Under Review"
  )

  const getActivityIcon = (action: string) => {
    if (action.includes("feedback") || action.includes("note")) {
      return <MessageSquareIcon className="size-4 text-blue-500" />
    }
    if (action.includes("approved")) {
      return <CheckCircle2Icon className="size-4 text-green-500 animate-pulse" />
    }
    if (action.includes("changes") || action.includes("improvement")) {
      return <AlertTriangleIcon className="size-4 text-amber-500" />
    }
    return <RocketIcon className="size-4 text-primary" />
  }

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
          value={adminMetrics.totalStudents}
          icon={UsersIcon}
          hint="Active founders"
        />
        <StatCard
          label="Total Startups"
          value={adminMetrics.totalStartups}
          icon={RocketIcon}
          hint="Incubation applications"
        />
        <StatCard
          label="Pending Reviews"
          value={adminMetrics.pendingReviews}
          icon={ClockIcon}
          hint="Action required"
        />
        <StatCard
          label="Approved / Ready"
          value={adminMetrics.approved}
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
              <Button render={<Link href="/admin/startups" />} nativeButton={false} variant="outline" size="sm">
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
                  {pendingStartups.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                      <div className="flex flex-col gap-1 max-w-[70%]">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{s.name}</span>
                          <StatusBadge status={s.status} />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Founder: {s.founder} · {s.category}
                        </span>
                      </div>
                      <Button render={<Link href={`/admin/startups/${s.id}`} />} nativeButton={false} size="sm" variant="ghost">
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities Panel */}
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
              <div className="flex flex-col gap-4 p-5">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex gap-3 text-xs leading-relaxed">
                    <div className="size-6 rounded-full border bg-background flex items-center justify-center shrink-0">
                      {getActivityIcon(log.action)}
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">{log.actor}</span>{" "}
                        {log.action}{" "}
                        <span className="font-semibold text-foreground">{log.target}</span>
                      </p>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        {log.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
