"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getMentorDashboardData, updateRequestStatus } from "@/services/mentorship.service"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function RequestsPage() {
  const [loading, setLoading] = React.useState(true)
  const [requests, setRequests] = React.useState<any[]>([])
  const [processing, setProcessing] = React.useState<string | null>(null)

  React.useEffect(() => {
    loadRequests()
  }, [])

  async function loadRequests() {
    const res = await getMentorDashboardData()
    if (res.error) {
      toast.error(res.error)
    } else {
      setRequests(res.pendingRequests || [])
    }
    setLoading(false)
  }

  async function handleStatusUpdate(id: string, status: 'accepted' | 'declined') {
    setProcessing(id)
    const res = await updateRequestStatus(id, status)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(`Request ${status} successfully`)
      setRequests(reqs => reqs.filter(r => r.id !== id))
    }
    setProcessing(null)
  }

  if (loading) {
    return <div className="flex flex-col gap-4 animate-in fade-in"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Mentoring Requests</h1>
        <p className="text-sm text-muted-foreground">Review and accept mentorship requests from startups.</p>
      </section>

      <div className="flex flex-col gap-4">
        {requests.map(req => (
          <Card key={req.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{req.teamName}</CardTitle>
                <CardDescription>{req.date}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleStatusUpdate(req.id, 'declined')}
                  disabled={processing === req.id}
                >
                  Decline
                </Button>
                <Button 
                  onClick={() => handleStatusUpdate(req.id, 'accepted')}
                  disabled={processing === req.id}
                >
                  Accept Request
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Topic: {req.topic}</span>
                <p className="text-sm text-muted-foreground">{req.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {requests.length === 0 && (
          <div className="text-sm text-muted-foreground">No pending requests at this time.</div>
        )}
      </div>
    </div>
  )
}
