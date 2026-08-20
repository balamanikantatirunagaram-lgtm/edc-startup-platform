import * as React from "react"
import Link from "next/link"
import {
  Lightbulb,
  FileCheck,
  Search,
  FlaskConical,
  Compass,
  Code2,
  Scale,
  Megaphone,
  Coins,
  Presentation,
  Rocket,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const STARTUP_FLOW_STAGES = [
  {
    step: 1,
    title: "Student with a Startup Idea",
    shortTitle: "Startup Idea",
    tagline: "The Spark",
    description: "Aspiring student founders identify high-impact problems, brainstorm innovative solutions, and formulate early-stage venture hypotheses.",
    icon: Lightbulb,
    category: "Ideation",
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  },
  {
    step: 2,
    title: "EDC Startup Registration",
    shortTitle: "Registration",
    tagline: "Official Entry",
    description: "Founders create or join a team, submit initial problem statements & solutions through the EDC Startup Portal, and get registered on campus.",
    icon: FileCheck,
    category: "Registration",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  },
  {
    step: 3,
    title: "Initial Idea Screening",
    shortTitle: "Idea Screening",
    tagline: "Evaluation",
    description: "The EDC review panel conducts an initial evaluation of uniqueness, feasibility, target market viability, and founder commitment.",
    icon: Search,
    category: "Screening",
    badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  },
  {
    step: 4,
    title: "Research & Development Team",
    shortTitle: "R&D Team",
    tagline: "Technical Depth",
    description: "Deep dive into market research, competitive landscaping, technical feasibility testing, and intellectual property / patent exploration.",
    icon: FlaskConical,
    category: "Research",
    badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
  },
  {
    step: 5,
    title: "Business Strategy Team",
    shortTitle: "Business Strategy",
    tagline: "Business Model",
    description: "Formulate the Business Model Canvas, define unit economics, customer personas, pricing models, and strategic go-to-market roadmaps.",
    icon: Compass,
    category: "Strategy",
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  {
    step: 6,
    title: "Product Development Team",
    shortTitle: "Product Dev",
    tagline: "Building the MVP",
    description: "Build, iterate, and deploy the functional prototype or Minimum Viable Product (MVP) with continuous feedback loops and testing.",
    icon: Code2,
    category: "Development",
    badgeColor: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  },
  {
    step: 7,
    title: "Legal & Compliance Team",
    shortTitle: "Legal & Compliance",
    tagline: "Entity & Governance",
    description: "Guidance on company incorporation (Pvt Ltd / LLP), founder equity agreements, trademark/IP filings, and regulatory compliance.",
    icon: Scale,
    category: "Legal",
    badgeColor: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  },
  {
    step: 8,
    title: "Marketing & Branding Team",
    shortTitle: "Marketing & Branding",
    tagline: "Traction & Brand",
    description: "Design brand identity, launch digital marketing campaigns, build customer acquisition funnels, and gain early user traction.",
    icon: Megaphone,
    category: "Marketing",
    badgeColor: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300",
  },
  {
    step: 9,
    title: "Finance & Funding Team",
    shortTitle: "Finance & Funding",
    tagline: "Capital & Valuation",
    description: "Financial modeling, valuation analysis, seed grant facilitation, cap table setup, and connecting with institutional funding programs.",
    icon: Coins,
    category: "Finance",
    badgeColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300",
  },
  {
    step: 10,
    title: "Pitch Preparation",
    shortTitle: "Pitch Prep",
    tagline: "Investor Readiness",
    description: "Masterclass pitch deck design, financial projection rehearsals, mock investor Q&A sessions, and storytelling polish.",
    icon: Presentation,
    category: "Pitch",
    badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  },
  {
    step: 11,
    title: "Demo Day / Investors / Incubation",
    shortTitle: "Demo Day & Incubation",
    tagline: "The Launchpad",
    description: "Pitch live on EDC Demo Day to angel investors, venture funds, and secure institutional incubation space with seed funding backing.",
    icon: Rocket,
    category: "Incubation",
    badgeColor: "bg-primary text-primary-foreground",
  },
]

export default function StartupFlow() {
  return (
    <div className="bg-background">
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-20 border-b">
        <div className="absolute inset-x-0 top-0 h-96 -z-10 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent"></div>
        <div className="container mx-auto px-4 md:px-6 max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>End-to-End Incubation Framework</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            The EDC <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Startup Flow</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            From a raw student idea on campus to pitching before top angel investors and entering full-scale incubation. Here is how EDC propels your venture through structured milestone stages.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Button 
              size="lg" 
              asChild
              className="h-13 px-8 text-base font-semibold bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-200 group rounded-xl"
            >
              <Link href="/startup">
                <span>Register Your Startup</span>
                <ArrowRight className="ml-2.5 h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              asChild
              className="h-13 px-8 text-base font-medium rounded-xl border-border/80 hover:bg-muted/80 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Link href="/about">Learn About EDC</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Flow Roadmap */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="relative">
            {/* Center Vertical Connecting Line */}
            <div className="hidden md:block absolute left-1/2 top-8 bottom-8 -translate-x-1/2 w-1 bg-gradient-to-b from-primary/80 via-primary/40 to-primary/80 rounded-full" />

            <div className="space-y-12 md:space-y-16">
              {STARTUP_FLOW_STAGES.map((stage, idx) => {
                const Icon = stage.icon
                const isEven = idx % 2 === 0

                return (
                  <div
                    key={stage.step}
                    className={`relative flex flex-col md:flex-row items-center ${
                      isEven ? "md:flex-row-reverse" : ""
                    } gap-8`}
                  >
                    {/* Content Card */}
                    <div className="w-full md:w-1/2">
                      <div className="rounded-2xl border bg-card/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all">
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                            Phase {stage.step}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Key Milestone
                          </span>
                        </div>
                        <h3 className="text-lg font-bold tracking-tight mb-2">
                          {stage.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {stage.description}
                        </p>
                      </div>
                    </div>

                    {/* Step Icon Badge Center */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 size-12 items-center justify-center rounded-2xl bg-background border-2 border-primary shadow-lg text-primary z-10">
                      <Icon className="size-5" />
                    </div>

                    {/* Spacer for opposite side */}
                    <div className="hidden md:block md:w-1/2" />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom Callout Banner */}
          <div className="mt-20 rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 sm:p-12 shadow-xl text-center space-y-6">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-white/10 text-white mx-auto">
              <Rocket className="size-7" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to take your idea through this journey?
            </h2>
            <p className="text-lg text-primary-foreground/85 max-w-2xl mx-auto">
              Get access to dedicated faculty mentors, student R&D teams, strategy advisors, and prepare your startup for investor Demo Day.
            </p>
            <div>
              <Button 
                size="lg" 
                variant="secondary" 
                asChild 
                className="h-13 px-8 text-base font-semibold shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 rounded-xl group"
              >
                <Link href="/startup">
                  <span>Get Started Today</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-200" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
