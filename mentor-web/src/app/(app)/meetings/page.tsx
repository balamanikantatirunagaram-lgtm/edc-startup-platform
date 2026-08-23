"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { getMyMeetings, updateMeetingStatus } from "@/services/meetings.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const res = await getMyMeetings()
      if (res.meetings) {
        setMeetings(res.meetings)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleStatus = async (id: string, status: 'accepted' | 'declined') => {
    setUpdating(id)
    const res = await updateMeetingStatus(id, status)
    setUpdating(null)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(`Meeting ${status}.`)
      setMeetings(prev => prev.map(m => m.id === id ? { ...m, status } : m))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meetings</h1>
        <p className="text-muted-foreground">Manage your meeting requests with startups.</p>
      </div>

      {loading ? (
        <p>Loading meetings...</p>
      ) : meetings.length === 0 ? (
        <p className="text-muted-foreground">You have no meeting requests.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {meetings.map(meeting => (
            <Card key={meeting.id}>
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle>{meeting.startups?.name || "Unknown Startup"}</CardTitle>
                    <CardDescription>
                      {meeting.direction === 'sent' ? 'Requested by you' : 'Incoming request'}
                    </CardDescription>
                  </div>
                  <Badge variant={meeting.status === 'accepted' ? 'default' : meeting.status === 'declined' ? 'destructive' : 'secondary'}>
                    {meeting.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="rounded-md bg-muted/50 p-2.5 italic">
                    &ldquo;{meeting.message || 'No message provided.'}&rdquo;
                  </p>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Proposed Time:</span>
                    <span className="font-medium">
                      {meeting.meeting_time ? new Date(meeting.meeting_time).toLocaleString() : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Requested On:</span>
                    <span>{new Date(meeting.created_at).toLocaleDateString()}</span>
                  </div>
                  {meeting.direction === 'received' && meeting.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        disabled={updating === meeting.id}
                        onClick={() => handleStatus(meeting.id, 'accepted')}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updating === meeting.id}
                        onClick={() => handleStatus(meeting.id, 'declined')}
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
