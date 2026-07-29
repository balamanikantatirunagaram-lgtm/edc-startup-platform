"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  RocketIcon,
  ArrowLeftIcon,
  MessageSquareIcon,
  GraduationCapIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  HistoryIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { adminStartups, StartupStatus } from "@/lib/mock-data"
import { Separator } from "@/components/ui/separator"

export default function AdminStartupReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = React.use(params)

  const startup = adminStartups.find((s) => s.id === id)

  // Review states
  const [status, setStatus] = React.useState<StartupStatus>(
    startup?.status ?? "Under Review"
  )
  const [reviewer, setReviewer] = React.useState("Dr. Neha Kapoor")
  const [feedback, setFeedback] = React.useState("")
  const [nextSteps, setNextSteps] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  if (!startup) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-xl font-bold">Startup Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1">
          The requested startup application could not be located.
        </p>
        <Button onClick={() => router.push("/admin/startups")} className="mt-4">
          Back to Startups
        </Button>
      </div>
    )
  }

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    setTimeout(() => {
      setSubmitting(false)
      // Simulate saving changes by changing the imported data locally for this session
      startup.status = status
      startup.history.push({
        status,
        date: new Date().toISOString().split("T")[0],
        reviewer,
        feedback: feedback || undefined,
        nextSteps: nextSteps || undefined,
      })

      toast.success(`Application status updated to ${status}.`)
      router.push("/admin/startups")
    }, 1200)
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex items-center gap-3">
        <Button
          onClick={() => router.push("/admin/startups")}
          variant="outline"
          size="icon"
          className="size-8"
        >
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{startup.name}</h1>
            <StatusBadge status={startup.status} />
          </div>
          <p className="text-xs text-muted-foreground">
            Reviewing application by {startup.founder}
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pitch Details */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <RocketIcon className="size-4 text-primary" />
                Venture Pitch Details
              </CardTitle>
              <CardDescription>Core value proposition, problem, and solution.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Tagline</span>
                <p className="text-sm font-medium">{startup.tagline}</p>
              </div>
              <Separator />
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase">The Problem</span>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                  {startup.problem}
                </p>
              </div>
              <Separator />
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase">The Solution</span>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                  {startup.solution}
                </p>
              </div>
              <Separator />
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Target Customers</span>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                  {startup.targetCustomers}
                </p>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <span className="text-xs text-muted-foreground block">Category</span>
                  <span className="text-sm font-medium mt-0.5 block">{startup.category}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Current Stage</span>
                  <span className="text-sm font-medium mt-0.5 block">{startup.stage}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Co-Founders</span>
                  <span className="text-sm font-medium mt-0.5 block">
                    {startup.coFounders.join(", ") || "None"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HistoryIcon className="size-4 text-primary" />
                Application History
              </CardTitle>
              <CardDescription>Past reviews, status changes, and notes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {startup.history.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-3 border-l-2 pl-4 border-muted/80 relative">
                    <div className="absolute -left-[5px] top-1 size-2 rounded-full bg-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">Moved to {h.status}</span>
                          <span className="text-muted-foreground">by {h.reviewer}</span>
                        </div>
                        <span className="text-muted-foreground">{h.date}</span>
                      </div>
                      {h.feedback && (
                        <p className="text-xs text-muted-foreground mt-1 rounded bg-muted/40 p-2 leading-relaxed">
                          {h.feedback}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review Form */}
        <div className="flex flex-col gap-6">
          <Card className="border-primary/20 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCapIcon className="size-4 text-primary animate-pulse" />
                Reviewer Panel
              </CardTitle>
              <CardDescription>Submit review notes and move application status.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitReview}>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel htmlFor="reviewerName">Reviewer Name</FieldLabel>
                    <Input
                      id="reviewerName"
                      value={reviewer}
                      onChange={(e) => setReviewer(e.target.value)}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="newStatus">Action / Status</FieldLabel>
                    <Select value={status} onValueChange={(val) => setStatus(val as StartupStatus)}>
                      <SelectTrigger id="newStatus" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Incubation Ready">Incubation Ready</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="feedbackText">Review Notes / Feedback</FieldLabel>
                    <Textarea
                      id="feedbackText"
                      placeholder="Write evaluation notes here..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="min-h-[100px] text-xs"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="nextStepsText">Next Steps for Founder</FieldLabel>
                    <Textarea
                      id="nextStepsText"
                      placeholder="What should the startup do next?"
                      value={nextSteps}
                      onChange={(e) => setNextSteps(e.target.value)}
                      className="min-h-[60px] text-xs"
                    />
                  </Field>

                  <Button type="submit" className="w-full mt-2" disabled={submitting}>
                    {submitting ? "Submitting Evaluation..." : "Submit Evaluation"}
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
