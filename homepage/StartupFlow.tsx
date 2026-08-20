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
            <Button size="lg" asChild>
              <Link href="/login">
                Register Your Startup <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
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
                const isEven = idx % 2 === 0
                const IconComponent = stage.icon
                return (
                  <div
                    key={stage.step}
                    className={`relative flex flex-col md:flex-row items-center gap-6 md:gap-12 ${
                      isEven ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Content Card */}
                    <div className="w-full md:w-1/2">
                      <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/40">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stage.badgeColor}`}>
                            Stage {stage.step}: {stage.category}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                            {stage.tagline}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                          <IconComponent className="h-5 w-5 shrink-0 text-primary md:hidden" />
                          {stage.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {stage.description}
                        </p>
                      </div>
                    </div>

                    {/* Step Icon Node in Center (Desktop) */}
                    <div className="relative z-10 hidden md:flex items-center justify-center">
                      <div className="relative flex size-14 items-center justify-center rounded-full bg-background border-4 border-primary shadow-md transition-transform duration-300 hover:scale-110">
                        <IconComponent className="size-6 text-primary" />
                        <span className="absolute -bottom-2 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                          {stage.step}
                        </span>
                      </div>
                    </div>

                    {/* Empty spacer for alignment */}
                    <div className="hidden md:block w-1/2" />
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
              <Button size="lg" variant="secondary" asChild className="font-semibold shadow-md">
                <Link href="/login">
                  Get Started Today <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
