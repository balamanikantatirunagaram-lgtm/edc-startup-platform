"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RocketIcon } from "lucide-react"
import { getMentorDashboardData } from "@/services/mentorship.service"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function StartupsPage() {
  const [loading, setLoading] = React.useState(true)
  const [startups, setStartups] = React.useState<any[]>([])

  React.useEffect(() => {
    async function load() {
      const res = await getMentorDashboardData()
      if (res.error) {
        toast.error(res.error)
      } else {
        setStartups(res.recentStartups || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in">
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">My Startups</h1>
        <p className="text-sm text-muted-foreground">Manage and track the progress of startups under your mentorship.</p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {startups.map(startup => (
          <Card key={startup.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <RocketIcon className="size-6 text-primary" />
              </div>
              <div className="flex flex-col flex-1">
                <CardTitle>{startup.name}</CardTitle>
                <CardDescription>{startup.industry} • {startup.stage}</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.href = `/startups/${startup.id}`}>Manage</Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mentorship Status</span>
                  <span className="font-medium text-primary capitalize">{startup.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {startups.length === 0 && (
          <div className="text-sm text-muted-foreground md:col-span-2">You don't have any active startups yet.</div>
        )}
      </div>
    </div>
  )
}
