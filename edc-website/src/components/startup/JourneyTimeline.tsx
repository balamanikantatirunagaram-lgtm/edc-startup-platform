"use client"

import { CheckCircle2Icon, RouteIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const JOURNEY_MILESTONES = [
  { step: 1, title: 'Student with a Startup Idea', category: 'Ideation', desc: 'Identify core problem, validate customer pain points, and brainstorm solution' },
  { step: 2, title: 'EDC Startup Registration', category: 'Registration', desc: 'Form student team and register startup application in EDC portal' },
  { step: 3, title: 'Initial Idea Screening', category: 'Screening', desc: 'Screening evaluation by EDC review panel on market feasibility' },
  { step: 4, title: 'Research & Development Team', category: 'R&D', desc: 'Market sizing, competitor analysis, IP research and technical architecture' },
  { step: 5, title: 'Business Strategy Team', category: 'Strategy', desc: 'Business Model Canvas, unit economics, and go-to-market strategy' },
  { step: 6, title: 'Product Development Team', category: 'Product', desc: 'Build and test Minimum Viable Product (MVP) with early user feedback' },
  { step: 7, title: 'Legal & Compliance Team', category: 'Legal', desc: 'Entity incorporation, founder agreements, and regulatory compliance' },
  { step: 8, title: 'Marketing & Branding Team', category: 'Marketing', desc: 'Brand positioning, digital presence, and customer acquisition channels' },
  { step: 9, title: 'Finance & Funding Team', category: 'Finance', desc: 'Financial modeling, valuation, seed grant support, and budget planning' },
  { step: 10, title: 'Pitch Preparation', category: 'Pitch Prep', desc: 'Pitch deck refinement, mock investor trials, and storytelling polish' },
  { step: 11, title: 'Demo Day / Investors / Incubation', category: 'Launchpad', desc: 'Live pitch to angel investors, venture funds, and incubation onboarding' }
]

export function JourneyTimeline({ currentStage }: { currentStage?: string | null }) {
  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute left-[15px] top-3 bottom-3 w-px bg-gradient-to-b from-primary/60 via-primary/25 to-transparent" />

      <ol className="space-y-1">
        {JOURNEY_MILESTONES.map((m) => {
          const reached = currentStage
            ? m.step <= Number(currentStage) || m.title.toLowerCase().includes(currentStage.toLowerCase())
            : m.step === 1

          return (
            <li key={m.step} className="relative flex gap-4 rounded-xl p-3 transition-colors hover:bg-muted/30">
              <div
                className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                  reached
                    ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                {reached ? <CheckCircle2Icon className="size-4" /> : m.step}
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className={`text-sm font-semibold ${reached ? "" : "text-muted-foreground"}`}>{m.title}</h4>
                  <Badge variant={reached ? "default" : "outline"} className="shrink-0">
                    {m.category}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{m.desc}</p>
              </div>
            </li>
          )
        })}
      </ol>

      <Button variant="outline" size="sm" className="mt-4 w-full" render={<a href="/startup/journey" />}>
        <RouteIcon className="size-4" />
        Open the Full Journey Tracker
      </Button>
    </div>
  )
}
