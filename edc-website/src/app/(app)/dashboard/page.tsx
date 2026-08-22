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
  PlusIcon,
  UsersIcon
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { getDashboardData } from "@/services/dashboard.service"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<any>(null)

  React.useEffect(() => {
    async function load() {
      const result = await getDashboardData()
      setData(result)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (data?.error) {
    return <div>Error: {data.error}</div>
  }

  const { user, startup, hasTeam, teamCode, teamName } = data

  let completedFields = 0
  if (user?.name) completedFields += 10
  if (user?.collegeId) completedFields += 10
  if (user?.email) completedFields += 10
  if (user?.phone) completedFields += 10
  if (user?.department) completedFields += 10
  if (user?.academicYear) completedFields += 10
  if (user?.skills?.length > 0) completedFields += 10
  if (user?.linkedin) completedFields += 10
  if (user?.github) completedFields += 10
  if (user?.portfolio) completedFields += 10
  
  const profileCompletion = completedFields
  const fieldsLeft = (100 - profileCompletion) / 10
  const fieldsLeftHint = fieldsLeft > 0 ? `${fieldsLeft} field${fieldsLeft > 1 ? "s" : ""} left` : "All complete!"

  const displayName = user?.name ? user.name.split(" ")[0] : "Student"

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          Welcome back, {displayName}!
        </h1>
        <p className="text-sm text-muted-foreground text-pretty">
          Here&apos;s where your startup stands with the EDC today.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {hasTeam && startup ? (
          <StatCard label="Startup status" value={startup.status} icon={RocketIcon} hint={startup.name} />
        ) : (
          <StatCard label="Team status" value={hasTeam ? "No Startup" : "No Team"} icon={UsersIcon} hint="Join or register" />
        )}
        <StatCard label="Profile complete" value={`${profileCompletion}%`} icon={UserCircleIcon} hint={fieldsLeftHint} />
        <StatCard label="Unread alerts" value={data?.unreadCount ?? 0} icon={BellIcon} hint="Notifications" />
        <StatCard label="Team Code" value={teamCode || 'None'} icon={TrendingUpIcon} hint="Share to invite" />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {hasTeam ? (
            startup ? (
              <Card>
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <CardTitle>{startup.name}</CardTitle>
                      <StatusBadge status={startup.status} />
                    </div>
                    <CardDescription>{startup.tagline}</CardDescription>
                  </div>
                  <Button render={<Link href="/startup" />} nativeButton={false} variant="outline" size="sm">
                    View Startup
                    <ArrowRightIcon data-icon="inline-end" />
                  </Button>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Meta label="Industry" value={startup.industry || 'Unknown'} />
                    <Meta label="Stage" value={startup.stage || 'Unknown'} />
                    <Meta label="Team" value={teamName} />
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Problem Statement</span>
                    <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                      {startup.problem || 'Not provided'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Team: {teamName}</CardTitle>
                  <CardDescription>You are part of a team but haven't registered a startup yet.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button render={<Link href="/startup/register" />} nativeButton={false}>
                    <PlusIcon className="mr-2 size-4" /> Register Startup
                  </Button>
                </CardContent>
              </Card>
            )
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <RocketIcon className="size-8 text-primary mb-2" />
                  <CardTitle>Register a Startup</CardTitle>
                  <CardDescription>Start a new application and create a team.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button render={<Link href="/startup/register" />} nativeButton={false} className="w-full">
                    Start Application
                  </Button>
                </CardContent>
              </Card>
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <UsersIcon className="size-8 text-primary mb-2" />
                  <CardTitle>Join a Team</CardTitle>
                  <CardDescription>Enter a code to join an existing team.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button render={<Link href="/team" />} nativeButton={false} variant="outline" className="w-full">
                    Join Team
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Complete your profile</CardTitle>
              <CardDescription>A full profile helps reviewers.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{profileCompletion}% complete</span>
                  <FileTextIcon className="size-4 text-muted-foreground" />
                </div>
                <Progress value={profileCompletion} />
              </div>
              <Button render={<Link href="/profile" />} nativeButton={false} variant="outline" size="sm" className="w-full">
                Update profile
              </Button>
            </CardContent>
          </Card>
          
          {hasTeam && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Team Settings</CardTitle>
                <CardDescription>Manage your team and invites.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button render={<Link href="/team" />} nativeButton={false} variant="outline" size="sm" className="w-full">
                  Manage Team
                </Button>
              </CardContent>
            </Card>
          )}
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
