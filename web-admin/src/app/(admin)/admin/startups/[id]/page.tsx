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
  TrashIcon,
  UserIcon,
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
import { getAllStartups, updateStartupStatus, getStartupDocumentsAdmin, getStartupJourneyAdmin, updateStartupJourneyStageAdmin, getTeamMembersAdmin, deleteStartupAdmin } from "@/services/admin.service"

const FLOW_STAGES = [
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

export default function AdminStartupReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = React.use(params)

  const [startup, setStartup] = React.useState<any>(null)
  const [documents, setDocuments] = React.useState<any[]>([])
  const [journeyStages, setJourneyStages] = React.useState<any[]>([])
  const [teamMembers, setTeamMembers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [status, setStatus] = React.useState("Under Review")
  const [reviewer, setReviewer] = React.useState("")
  const [feedback, setFeedback] = React.useState("")
  const [nextSteps, setNextSteps] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [updatingStage, setUpdatingStage] = React.useState<string | null>(null)
  const [stageFeedbackInputs, setStageFeedbackInputs] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    async function loadData() {
      const allStartups = await getAllStartups()
      const found = Array.isArray(allStartups) ? allStartups.find((s: any) => s.id === id) : undefined
      if (found) {
        setStartup(found)
        setStatus(found.status || "Under Review")
        
        if (found.teams?.id) {
          const tmRes = await getTeamMembersAdmin(found.teams.id)
          if (tmRes.members) setTeamMembers(tmRes.members)
        }
      }
      
      const docsRes = await getStartupDocumentsAdmin(id)
      if (docsRes.documents) setDocuments(docsRes.documents)
      
      const journeyRes = await getStartupJourneyAdmin(id as string)
      if (journeyRes.stages) setJourneyStages(journeyRes.stages)
      
      setLoading(false)
    }
    loadData()
  }, [id])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await updateStartupStatus(id as string, status, feedback, nextSteps, reviewer)
    setSubmitting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(`Status updated to ${status}.`)
      router.push("/admin/startups")
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${startup?.name}" and its entire team? This action cannot be undone.`)) return
    setDeleting(true)
    const res = await deleteStartupAdmin(id)
    setDeleting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(`"${startup?.name}" has been deleted.`)
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
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-3">
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
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <UserIcon className="size-3" />
              Led by <span className="font-medium text-foreground">{startup.leaderName || 'Unknown'}</span>
              {startup.leaderEmail && <span className="ml-1">({startup.leaderEmail})</span>}
              · Team: {startup.teams?.name} · {startup.memberCount || 0} members
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          disabled={deleting}
          onClick={handleDelete}
          className="gap-2"
        >
          {deleting ? <Loader2Icon className="size-4 animate-spin" /> : <TrashIcon className="size-4" />}
          Delete Startup
        </Button>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team Roster</CardTitle>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No team members assigned.</p>
              ) : (
                <ul className="space-y-3">
                  {teamMembers.map((member: any, idx: number) => {
                    const isLeader = member.student_id === startup.teams?.leader_id
                    return (
                      <li key={idx} className={`flex justify-between items-center text-sm p-3 rounded-md border ${isLeader ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'}`}>
                        <div className="flex flex-col">
                          <p className="font-medium">
                            {member.students?.name || "Unknown"}
                            {isLeader && <span className="text-xs bg-primary/10 text-primary ml-2 px-2 py-0.5 rounded-full font-semibold">👑 Leader</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">{member.students?.email} · {member.students?.department || 'N/A'}</p>
                        </div>
                        <span className="text-xs bg-secondary px-2 py-1 rounded-md">{member.status}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
          
          {/* Documents Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents uploaded.</p>
              ) : (
                <ul className="space-y-3">
                  {documents.map((doc, idx) => (
                    <li key={idx} className="flex justify-between items-center text-sm p-3 bg-muted/30 rounded-md border">
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.doc_type}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => window.open(doc.file_url, '_blank')}>View</Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          
          {/* Journey Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Startup Flow & Milestone Status</CardTitle>
                <CardDescription>Update progress across the 10-phase incubation lifecycle.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {FLOW_STAGES.map((stageName, idx) => {
                  const dbStage = journeyStages.find(
                    (s) => s.stage_name === stageName || s.stage_name?.includes(stageName)
                  )
                  const currentStageStatus = dbStage?.status || "pending"

                  return (
                    <div key={idx} className="flex flex-col gap-2 p-3.5 rounded-xl border bg-card/60">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-sm">{stageName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={currentStageStatus}
                            onValueChange={async (newVal) => {
                              if (!newVal) return
                              setUpdatingStage(stageName)
                              const res = await updateStartupJourneyStageAdmin(
                                id,
                                stageName,
                                newVal,
                                stageFeedbackInputs[stageName]
                              )
                              setUpdatingStage(null)
                              if (res.error) {
                                toast.error(res.error)
                              } else {
                                toast.success(`Stage "${stageName}" updated to ${newVal}`)
                                const journeyRes = await getStartupJourneyAdmin(id as string)
                                if (journeyRes.stages) setJourneyStages(journeyRes.stages)
                              }
                            }}
                          >
                            <SelectTrigger className="w-[140px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="Under Review">Under Review</SelectItem>
                              <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="Approved">Approved</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {dbStage?.feedback && (
                        <p className="text-xs text-muted-foreground bg-muted/60 p-2 rounded whitespace-pre-wrap">
                          {dbStage.feedback}
                        </p>
                      )}
                    </div>
                  )
                })}
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
                    <Select value={status} onValueChange={(v) => setStatus(v ?? '')}>
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
