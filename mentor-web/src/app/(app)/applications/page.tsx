"use client"

import { useEffect, useState } from "react"
import { getFundingApplications, updateApplicationStatus } from "@/services/funding.service"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  const handleUpdateStatus = async (appId: string, status: string) => {
    let feedback = ""
    if (status === 'rejected' || status === 'accepted') {
      feedback = prompt("Enter feedback for the startup:") || ""
    }
    const res = await updateApplicationStatus(appId, status, feedback)
    if (res.success) {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status, feedback } : a))
    } else {
      alert("Failed to update status")
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
                  <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(app.id, 'under_review')}>
                    Mark Reviewing
                  </Button>
                )}
                {app.status === 'under_review' && (
                  <>
                    <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(app.id, 'rejected')}>
                      Reject
                    </Button>
                    <Button variant="default" size="sm" onClick={() => handleUpdateStatus(app.id, 'accepted')}>
                      Accept
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
