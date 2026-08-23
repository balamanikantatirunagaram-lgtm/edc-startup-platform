"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Loader2, MessageSquare, Plus, FileText, CheckCircle2, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { addJourneyStageFeedback, getStartupJourney, getStartupDocuments, updateJourneyStageMentor } from "@/services/startup.service"

const MENTOR_FLOW_STAGES = [
  "Student with a Startup Idea",
  "EDC Startup Registration",
  "Initial Idea Screening",
  "Research & Development Team",
  "Business Strategy Team",
  "Product Development Team",
  "Legal & Compliance Team",
  "Marketing & Branding Team",
  "Finance & Funding Team",
  "Pitch Preparation",
  "Demo Day / Investors / Incubation",
]

export default function MentorStartupDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stages, setStages] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState<string | null>(null)

  useEffect(() => {
    if (id) loadData()
  }, [id])

  async function loadData() {
    setLoading(true)
    
    const [journeyRes, docsRes] = await Promise.all([
      getStartupJourney(id as string),
      getStartupDocuments(id as string)
    ])
    
    if (journeyRes.stages) setStages(journeyRes.stages)
    if (docsRes.documents) setDocuments(docsRes.documents)
      
    setLoading(false)
  }

  async function handleStageStatusUpdate(stageName: string, newStatus: string) {
    setSubmitting(stageName)
    const feedback = feedbackInputs[stageName]
    const res = await updateJourneyStageMentor(id as string, stageName, newStatus, feedback)
    setSubmitting(null)
    
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(`Stage "${stageName}" updated to ${newStatus}`)
      setFeedbackInputs(prev => ({ ...prev, [stageName]: "" }))
      loadData()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <Button variant="ghost" className="mb-4 -ml-4 gap-2" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" /> Back to Startups
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentorship & Journey Review</h1>
          <p className="text-muted-foreground mt-1">Review the 10-step startup flow, provide milestone guidance, and track submitted documents.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" /> Incubation Milestones & Flow
          </h2>
          <div className="space-y-4">
            {MENTOR_FLOW_STAGES.map((stageName, idx) => {
              const dbStage = stages.find(s => s.stage_name === stageName || s.stage_name?.includes(stageName))
              const currentStatus = dbStage?.status || 'pending'

              return (
                <Card key={idx} className="border-border shadow-sm">
                  <CardHeader className="pb-3 bg-muted/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                          {idx + 1}
                        </span>
                        <CardTitle className="text-base font-semibold">{stageName}</CardTitle>
                      </div>
                      <Badge variant={currentStatus === 'completed' || currentStatus === 'approved' ? 'default' : 'secondary'} className="w-fit">
                        {currentStatus}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {dbStage?.feedback ? (
                      <div className="bg-secondary/20 p-3 rounded-xl border border-secondary text-xs">
                        <h5 className="font-semibold text-secondary-foreground mb-1 uppercase tracking-wider">Guidance Notes</h5>
                        <p className="text-muted-foreground whitespace-pre-wrap">{dbStage.feedback}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No guidance notes recorded yet.</p>
                    )}
                    
                    <div className="space-y-3 pt-2 border-t">
                      <Textarea 
                        placeholder="Add guidance or evaluation feedback..."
                        value={feedbackInputs[stageName] || ""}
                        onChange={e => setFeedbackInputs(prev => ({...prev, [stageName]: e.target.value}))}
                        className="min-h-[70px] text-xs resize-none"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-xs"
                          disabled={submitting === stageName}
                          onClick={() => handleStageStatusUpdate(stageName, 'in_progress')}
                        >
                          In Progress
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-xs"
                          disabled={submitting === stageName}
                          onClick={() => handleStageStatusUpdate(stageName, 'needs_improvement')}
                        >
                          Needs Work
                        </Button>
                        <Button 
                          size="sm" 
                          className="text-xs bg-green-600 hover:bg-green-700 text-white gap-1.5"
                          disabled={submitting === stageName}
                          onClick={() => handleStageStatusUpdate(stageName, 'completed')}
                        >
                          {submitting === stageName ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          Pass / Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Uploaded Documents
          </h2>
          <Card className="border-border shadow-sm">
            <CardContent className="p-0 divide-y divide-border">
              {documents.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No documents available for review.
                </div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs font-normal bg-background px-1.5 py-0">
                          {doc.doc_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => window.open(doc.file_url, '_blank')} className="gap-2">
                      <ExternalLink className="h-4 w-4" /> View
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
