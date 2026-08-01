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
  Loader2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/StatusBadge"
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
import { Separator } from "@/components/ui/separator"
import { getAllStartups, updateStartupStatus } from "@/services/admin.service"

export default function AdminStartupReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = React.use(params)

  const [startup, setStartup] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [status, setStatus] = React.useState("Under Review")
  const [reviewer, setReviewer] = React.useState("")
  const [feedback, setFeedback] = React.useState("")
  const [nextSteps, setNextSteps] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    getAllStartups().then(res => {
      const found = Array.isArray(res) ? res.find((s: any) => s.id === id) : undefined
      if (found) {
        setStartup(found)
        setStatus(found.status || "Under Review")
      }
      setLoading(false)
    })
  }, [id])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await updateStartupStatus(id, status)
    setSubmitting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(`Status updated to ${status}.`)
      router.push("/admin/startups")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

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
            Reviewing application by {startup.teams?.leader_id || "Unknown Leader"}
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
              {startup.tagline && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Tagline</span>
                    <p className="text-sm font-medium">{startup.tagline}</p>
                  </div>
                  <Separator />
                </>
              )}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase">The Problem</span>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                  {startup.problem_statement || startup.problem || "Not provided."}
                </p>
              </div>
              <Separator />
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase">The Solution</span>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                  {startup.proposed_solution || startup.solution || "Not provided."}
                </p>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <span className="text-xs text-muted-foreground block">Industry</span>
                  <span className="text-sm font-medium mt-0.5 block">{startup.industry || "N/A"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Current Stage</span>
                  <span className="text-sm font-medium mt-0.5 block">{startup.stage || "N/A"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Team</span>
                  <span className="text-sm font-medium mt-0.5 block">{startup.teams?.name || "N/A"}</span>
                </div>
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
                      placeholder="Your name"
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="newStatus">Action / Status</FieldLabel>
                    <Select value={status} onValueChange={setStatus}>
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
                    {submitting ? "Submitting..." : "Submit Evaluation"}
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
