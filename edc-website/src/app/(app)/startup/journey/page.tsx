"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react"
import { getStartupJourney, advanceJourneyStage } from "@/services/startup.service"
import { toast } from "sonner"

const DEFAULT_STAGES = [
  { id: '1', title: 'Student with a Startup Idea', status: 'pending', desc: 'Identify core problem, validate customer pain points, and brainstorm solution' },
  { id: '2', title: 'EDC Startup Registration', status: 'pending', desc: 'Form student team and register startup application in EDC portal' },
  { id: '3', title: 'Initial Idea Screening', status: 'pending', desc: 'Screening evaluation by EDC review panel on market feasibility' },
  { id: '4', title: 'Research & Development Team', status: 'pending', desc: 'Market sizing, competitor analysis, IP research and technical architecture' },
  { id: '5', title: 'Business Strategy Team', status: 'pending', desc: 'Business Model Canvas, unit economics, and go-to-market strategy' },
  { id: '6', title: 'Product Development Team', status: 'pending', desc: 'Build and test Minimum Viable Product (MVP) with early user feedback' },
  { id: '7', title: 'Legal & Compliance Team', status: 'pending', desc: 'Entity incorporation, founder agreements, and regulatory compliance' },
  { id: '8', title: 'Marketing & Branding Team', status: 'pending', desc: 'Brand positioning, digital presence, and customer acquisition channels' },
  { id: '9', title: 'Finance & Funding Team', status: 'pending', desc: 'Financial modeling, valuation, seed grant support, and budget planning' },
  { id: '10', title: 'Pitch Preparation', status: 'pending', desc: 'Pitch deck refinement, mock investor trials, and storytelling polish' },
  { id: '11', title: 'Demo Day / Investors / Incubation', status: 'pending', desc: 'Live pitch to angel investors, venture funds, and incubation onboarding' }
]

export default function StartupJourneyPage() {
  const [journeyStages, setJourneyStages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const res = await getStartupJourney()
    if (res.stages && res.stages.length > 0) {
      let firstPending = 0
      const mapped = DEFAULT_STAGES.map((ds, idx) => {
        const dbStage = res.stages.find((s: any) => s.stage_name === ds.title)
        if (dbStage) {
          return { ...ds, status: dbStage.status, date: new Date(dbStage.created_at).toLocaleDateString(), dbId: dbStage.id }
        }
        if (firstPending === 0) firstPending = idx
        return ds
      })
      // Make the first pending one "in-progress" if previous was completed
      const activeIdx = mapped.findIndex(s => s.status === 'pending' || s.status === 'Needs Improvement')
      if (activeIdx !== -1) {
        if (mapped[activeIdx].status === 'pending') {
          mapped[activeIdx].status = 'in-progress'
        }
        setCurrentPhaseIdx(activeIdx)
      } else {
        setCurrentPhaseIdx(mapped.length) // all done
      }
      
      setJourneyStages(mapped)
    } else {
      // First stage is in-progress
      const def = [...DEFAULT_STAGES]
      def[0].status = 'in-progress'
      setJourneyStages(def)
      setCurrentPhaseIdx(0)
    }
    setLoading(false)
  }

  async function handleSubmitReview(stageName: string) {
    setSubmitting(true)
    const res = await advanceJourneyStage(stageName, 'Under Review')
    setSubmitting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Submitted for review!")
      load()
    }
  }

  const progressPercent = Math.round((currentPhaseIdx / DEFAULT_STAGES.length) * 100)

  return (
    <div className="container max-w-4xl py-8 mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Startup Journey Tracker</h1>
        <p className="text-muted-foreground mt-2">Track your progress from Idea to Incubation. Complete stages to unlock the next level.</p>
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-6 relative">
          <div className="absolute left-[28px] top-[40px] bottom-[40px] w-0.5 bg-border -z-10" />
          
          {journeyStages.map((stage, idx) => (
            <Card key={stage.id} className={`border-2 ${stage.status === 'in-progress' ? 'border-primary' : 'border-border'} ${stage.status === 'pending' ? 'opacity-70' : ''}`}>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="mt-1 bg-background">
                  {stage.status === 'completed' ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500 fill-green-50" />
                  ) : stage.status === 'in-progress' ? (
                    <Clock className="h-6 w-6 text-primary fill-primary/10 animate-pulse" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{idx + 1}. {stage.title}</h3>
                      <p className="text-sm text-muted-foreground">{stage.desc}</p>
                    </div>
                    {stage.date && (
                      <span className="text-xs font-medium bg-muted px-2 py-1 rounded-md">
                        {stage.date}
                      </span>
                    )}
                  </div>
                  
                  {stage.status === 'in-progress' && (
                    <div className="mt-4 flex gap-3">
                      <Button size="sm" onClick={() => handleSubmitReview(stage.title)} disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit for Review"}
                      </Button>
                      <Button size="sm" variant="outline">View Tasks</Button>
                    </div>
                  )}
                  
                  {stage.status === 'Under Review' && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 text-sm rounded-md border border-yellow-200 dark:border-yellow-900/50 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Currently under review by your assigned mentor
                    </div>
                  )}
                  
                  {stage.status === 'Approved' && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-sm rounded-md border border-green-200 dark:border-green-900/50 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Approved by Mentor Team
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Phase</CardTitle>
              <CardDescription>You are currently in Phase {currentPhaseIdx + 1}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2">{progressPercent}%</div>
              <div className="w-full bg-secondary rounded-full h-2.5 mb-4">
                <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Complete the current stage to advance.</p>
              <Button className="w-full justify-between group">
                Continue Working 
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Get Mentor Support</CardTitle>
              <CardDescription>Connect with EDC mentors to accelerate your current stage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your assigned mentors will appear here once you request mentorship. Browse the
                mentor directory and send a request for your current stage.
              </p>
              <Button variant="outline" render={<a href="/mentors" />} className="w-full">
                Browse Mentors
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
