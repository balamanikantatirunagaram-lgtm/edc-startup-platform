"use client"

import * as React from "react"
import { toast } from "sonner"
import { CalendarIcon, ClockIcon, Loader2Icon, InboxIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getMyMeetingRequests, respondToMeetingRequest, type MeetingRequestView } from "@/services/meetings.service"

export default function StartupMeetingsPage() {
  const [requests, setRequests] = React.useState<MeetingRequestView[]>([])
  const [loading, setLoading] = React.useState(true)
  const [acting, setActing] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    getMyMeetingRequests().then(res => {
      if (!active) return
      if (res.requests) setRequests(res.requests)
      setLoading(false)
    }).catch(() => setLoading(false))
    return () => { active = false }
  }, [])

  async function decide(id: string, decision: 'accepted' | 'declined') {
    setActing(id)
    const res = await respondToMeetingRequest(id, decision)
    setActing(null)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success(decision === 'accepted' ? 'Meeting accepted — the mentor has been notified.' : 'Meeting declined — the mentor has been notified.')
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: decision } : r))
  }

  const pending = requests.filter(r => r.status === 'pending')
  const decided = requests.filter(r => r.status !== 'pending')

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto mt-6 px-4 pb-20 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meeting Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Mentors can request meetings with your team. Accept to confirm, or decline with one click — the mentor is notified either way.
        </p>
      </div>

      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-dashed py-14 text-center">
          <InboxIcon className="mx-auto mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No meeting requests yet.</p>
          <p className="text-xs text-muted-foreground mt-1">When a mentor requests a meeting, it will appear here for you to accept or decline.</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Awaiting your response ({pending.length})</h2>
              {pending.map(req => <RequestCard key={req.id} req={req} acting={acting} onDecide={decide} />)}
            </section>
          )}
          {decided.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">History</h2>
              {decided.map(req => <RequestCard key={req.id} req={req} acting={acting} onDecide={decide} readOnly />)}
            </section>
          )}
        </>
      )}
    </div>
  )
}

function RequestCard({ req, acting, onDecide, readOnly }: {
  req: MeetingRequestView
  acting: string | null
  onDecide: (id: string, d: 'accepted' | 'declined') => void
  readOnly?: boolean
}) {
  const initials = req.mentorName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {initials}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{req.mentorName}</CardTitle>
              <CardDescription className="truncate">wants to meet with your team</CardDescription>
            </div>
          </div>
          <Badge variant={req.status === 'accepted' ? 'default' : req.status === 'declined' ? 'destructive' : 'secondary'} className="shrink-0 capitalize">
            {req.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="rounded-lg bg-muted/50 p-3 text-sm italic">&ldquo;{req.message || 'No message provided.'}&rdquo;</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarIcon className="size-3.5" />
            Sent {new Date(req.createdAt).toLocaleDateString()}
          </span>
          {req.meetingTime && (
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="size-3.5" />
              Proposed: {new Date(req.meetingTime).toLocaleString()}
            </span>
          )}
        </div>
        {!readOnly && req.status === 'pending' && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" disabled={acting === req.id} onClick={() => onDecide(req.id, 'accepted')}>
              {acting === req.id ? <Loader2Icon className="size-4 animate-spin" /> : null}
              Accept
            </Button>
            <Button size="sm" variant="outline" disabled={acting === req.id} onClick={() => onDecide(req.id, 'declined')}>
              Decline
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
