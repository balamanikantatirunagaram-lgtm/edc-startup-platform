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
import { addJourneyStageFeedback, getStartupJourney } from "@/services/startup.service" // I need to create this function
import { getStartupDocuments } from "@/services/startup.service" // I need to verify this function

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
    
    // Fetch journey stages and documents (Assuming we can fetch them via a service)
    const [journeyRes, docsRes] = await Promise.all([
      getStartupJourney(id as string),
      getStartupDocuments(id as string)
    ])
    
    if (journeyRes.stages) setStages(journeyRes.stages)
    if (docsRes.documents) setDocuments(docsRes.documents)
      
    setLoading(false)
  }

  async function handleAddFeedback(stageId: string) {
    const feedback = feedbackInputs[stageId]
    if (!feedback) return
    
    setSubmitting(stageId)
    const res = await addJourneyStageFeedback(stageId, feedback)
    setSubmitting(null)
    
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Feedback added successfully!")
      setFeedbackInputs(prev => ({ ...prev, [stageId]: "" }))
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
          <h1 className="text-3xl font-bold tracking-tight">Mentorship Dashboard</h1>
          <p className="text-muted-foreground mt-1">Review journey stages and documents for this startup.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" /> Journey Stages
          </h2>
          {stages.length === 0 ? (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="pt-6 text-center text-muted-foreground text-sm">
                No journey stages recorded yet.
              </CardContent>
            </Card>
          ) : (
            stages.map(stage => (
              <Card key={stage.id} className="border-border shadow-sm">
                <CardHeader className="pb-3 bg-muted/10">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{stage.stage_name}</CardTitle>
                    <Badge variant={stage.status === 'completed' ? 'default' : 'secondary'}>
                      {stage.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {stage.feedback ? (
                    <div className="bg-secondary/20 p-4 rounded-xl border border-secondary text-sm">
                      <h5 className="font-semibold text-secondary-foreground mb-1 text-xs uppercase tracking-wider">Current Feedback</h5>
                      <p className="text-muted-foreground whitespace-pre-wrap">{stage.feedback}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No feedback provided yet.</p>
                  )}
                  
                  <div className="space-y-3 pt-3 border-t">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add New Feedback</p>
                    <Textarea 
                      placeholder="Share your guidance, critiques, or next steps..."
                      value={feedbackInputs[stage.id] || ""}
                      onChange={e => setFeedbackInputs(prev => ({...prev, [stage.id]: e.target.value}))}
                      className="min-h-[100px] text-sm resize-none"
                    />
                    <Button 
                      size="sm" 
                      className="w-full gap-2" 
                      disabled={!feedbackInputs[stage.id] || submitting === stage.id}
                      onClick={() => handleAddFeedback(stage.id)}
                    >
                      {submitting === stage.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                      Submit Feedback
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
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
