"use client"

import { useEffect, useState } from "react"
import { getMyMeetings, updateMeetingStatus } from "@/services/meetings.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{meeting.startups?.name || "Unknown Startup"}</CardTitle>
                    <CardDescription>{meeting.topic}</CardDescription>
                  </div>
                  <Badge variant={meeting.status === 'accepted' ? 'default' : meeting.status === 'rejected' ? 'destructive' : 'secondary'}>
                    {meeting.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preferred Time:</span>
                    <span className="font-medium">{meeting.preferred_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Requested On:</span>
                    <span>{new Date(meeting.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
