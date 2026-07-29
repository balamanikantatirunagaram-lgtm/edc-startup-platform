"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRightIcon,
  BellIcon,
  FileTextIcon,
  MessageSquareIcon,
  RocketIcon,
  SparklesIcon,
  TrendingUpIcon,
  UserCircleIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { StatusTimeline } from "@/components/status-timeline"
import { useAppState } from "@/lib/app-state-context"

export default function DashboardPage() {
  const { currentUser, currentStartup, notifications } = useAppState()
  const unread = notifications.filter((n) => !n.read)
  const latestFeedback = [...currentStartup.history].reverse().find((h) => h.feedback)

  let completedFields = 0
  const totalFields = 8
  if (currentUser.fullName) completedFields++
  if (currentUser.collegeId) completedFields++
  if (currentUser.phone) completedFields++
  if (currentUser.email) completedFields++
  if (currentUser.department) completedFields++
  if (currentUser.academicYear) completedFields++
  if (currentUser.linkedin) completedFields++
  if (currentUser.github || currentUser.portfolio) completedFields++
  
  const fieldsLeft = totalFields - completedFields
  const fieldsLeftHint = fieldsLeft > 0 ? `${fieldsLeft} field${fieldsLeft > 1 ? "s" : ""} left` : "All complete!"

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          Welcome back, {currentUser.fullName.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground text-pretty">
          Here&apos;s where your startup stands with the EDC today.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Startup status" value={currentStartup.status} icon={RocketIcon} hint={currentStartup.name} />
        <StatCard label="Profile complete" value={`${currentUser.profileCompletion}%`} icon={UserCircleIcon} hint={fieldsLeftHint} />
        <StatCard label="Unread alerts" value={unread.length} icon={BellIcon} hint="Notifications" />
        <StatCard label="Weekly actives" value="620" icon={TrendingUpIcon} hint="+18% this week" />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <CardTitle>{currentStartup.name}</CardTitle>
                  <StatusBadge status={currentStartup.status} />
                </div>
                <CardDescription>{currentStartup.tagline}</CardDescription>
              </div>
              <Button render={<Link href="/startup" />} nativeButton={false} variant="outline" size="sm">
                View
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <Meta label="Category" value={currentStartup.category} />
                <Meta label="Stage" value={currentStartup.stage} />
                <Meta label="Team size" value={`${currentStartup.teamMembers.length} members`} />
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Current progress</span>
                <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                  {currentStartup.currentProgress}
                </p>
              </div>
            </CardContent>
          </Card>

          {latestFeedback && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquareIcon className="size-4 text-primary" />
                  Latest reviewer feedback
                </CardTitle>
                <CardDescription>
                  From {latestFeedback.reviewer} · {latestFeedback.date}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed text-pretty">
                  {latestFeedback.feedback}
                </p>
                {latestFeedback.nextSteps && (
                  <div className="flex items-start gap-2 text-sm">
                    <SparklesIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">Next steps: </span>
                      {latestFeedback.nextSteps}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Application progress</CardTitle>
              <CardDescription>Track your startup through the pipeline.</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusTimeline current={currentStartup.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Complete your profile</CardTitle>
              <CardDescription>A full profile helps reviewers.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{currentUser.profileCompletion}% complete</span>
                  <FileTextIcon className="size-4 text-muted-foreground" />
                </div>
                <Progress value={currentUser.profileCompletion} />
              </div>
              <Button render={<Link href="/profile" />} nativeButton={false} variant="outline" size="sm" className="w-full">
                Update profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
