"use client"

import { useEffect, useState } from "react"
import { getFundingApplications, updateApplicationStatus } from "@/services/funding.service"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { toast } from "sonner"

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Feedback dialog state
  const [feedbackApp, setFeedbackApp] = useState<{ id: string; status: string } | null>(null)
  const [feedback, setFeedback] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const res = await getFundingApplications()
      if (res.applications) {
        setApplications(res.applications)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleUpdateStatus = async () => {
    if (!feedbackApp) return
    setSubmitting(true)
    const res = await updateApplicationStatus(feedbackApp.id, feedbackApp.status, feedback)
    setSubmitting(false)
    if (res.success) {
      setApplications(prev => prev.map(a => a.id === feedbackApp.id ? { ...a, status: feedbackApp.status, feedback } : a))
      toast.success(`Application ${feedbackApp.status.replace('_', ' ')}.`)
      setFeedbackApp(null)
      setFeedback("")
    } else {
      toast.error("Failed to update status")
    }
  }

  const openFeedback = (appId: string, status: string) => {
    setFeedbackApp({ id: appId, status })
    setFeedback("")
  }

  const handleMarkReviewing = async (appId: string) => {
    const res = await updateApplicationStatus(appId, 'under_review', "")
    if (res.success) {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'under_review' } : a))
      toast.success("Application marked as under review.")
    } else {
      toast.error("Failed to update status")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Funding Applications</h1>
        <p className="text-muted-foreground">Review applications from startups for funding and incubation.</p>
      </div>

      {loading ? (
        <p>Loading applications...</p>
      ) : applications.length === 0 ? (
        <p className="text-muted-foreground">No applications found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map(app => (
            <Card key={app.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{app.startups?.name || "Unknown Startup"}</CardTitle>
                    <CardDescription>{app.type} - {app.amount_requested}</CardDescription>
                  </div>
                  <Badge variant={
                    app.status === 'accepted' ? 'default' : 
                    app.status === 'rejected' ? 'destructive' : 
                    app.status === 'under_review' ? 'secondary' : 'outline'
                  }>
                    {app.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold block mb-1">Pitch:</span>
                    <p className="text-muted-foreground">{app.pitch_summary}</p>
                  </div>
                  {app.feedback && (
                    <div className="mt-4 pt-4 border-t">
                      <span className="font-semibold block mb-1">Feedback:</span>
                      <p className="text-muted-foreground">{app.feedback}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                {app.status === 'pending' && (
                  <Button variant="outline" size="sm" onClick={() => handleMarkReviewing(app.id)}>
                    Mark Reviewing
                  </Button>
                )}
                {app.status === 'under_review' && (
                  <>
                    <Button variant="destructive" size="sm" onClick={() => openFeedback(app.id, 'rejected')}>
                      Reject
                    </Button>
                    <Button variant="default" size="sm" onClick={() => openFeedback(app.id, 'accepted')}>
                      Accept
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Feedback dialog */}
      <Dialog open={!!feedbackApp} onOpenChange={(open) => !open && setFeedbackApp(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {feedbackApp?.status === 'accepted' ? 'Accept application' : 'Reject application'}
            </DialogTitle>
            <DialogDescription>
              Leave feedback for the startup team.
            </DialogDescription>
          </DialogHeader>
          <Field className="py-2">
            <FieldLabel>Feedback</FieldLabel>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Strong traction, but clarify your revenue model before the next review."
              rows={4}
            />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackApp(null)}>Cancel</Button>
            <Button
              variant={feedbackApp?.status === 'rejected' ? 'destructive' : 'default'}
              onClick={handleUpdateStatus}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
