"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Briefcase, FileText, Calendar, CheckCircle, Clock, XCircle } from "lucide-react"
import { getMyApplications } from "@/services/jobs.service"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await getMyApplications()
      if (res.applications) setApplications(res.applications)
      setLoading(false)
    }
    load()
  }, [])

  const getStatusConfig = (status: string) => {
    switch(status.toLowerCase()) {
      case 'accepted':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle }
      case 'rejected':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle }
      case 'reviewed':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock }
      default:
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Clock }
    }
  }

  return (
    <div className="container max-w-5xl py-10 mx-auto px-4">
      <div className="flex flex-col mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          My <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Applications</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Track the status of your job and internship applications.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-2xl border border-dashed flex flex-col items-center">
          <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold mb-2">No applications yet</h3>
          <p className="text-muted-foreground mb-6">Explore the jobs board to find your next opportunity.</p>
          <Button asChild>
            <Link href="/jobs">View Jobs</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => {
            const StatusIcon = getStatusConfig(app.status).icon
            const job = app.job_postings
            return (
              <Card key={app.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{job?.title}</CardTitle>
                      <p className="text-muted-foreground mt-1 font-medium">{job?.startups?.name}</p>
                    </div>
                    <Badge variant="outline" className={`px-3 py-1 flex items-center gap-1.5 ${getStatusConfig(app.status).color}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      <span className="capitalize">{app.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" /> Applied on {new Date(app.applied_at).toLocaleDateString()}
                    </div>
                    {app.resume_url && (
                      <div className="flex items-center gap-2 text-primary">
                        <FileText className="h-4 w-4" /> 
                        <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="hover:underline">View Attached Resume</a>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Your Cover Letter:</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg italic whitespace-pre-wrap">
                      "{app.cover_letter}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
