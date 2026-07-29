"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  RocketIcon,
  UsersIcon,
  FileTextIcon,
  PlusIcon,
  GlobeIcon,
  VideoIcon,
  LinkIcon,
  ArrowUpRightIcon,
  Edit2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { StatusTimeline } from "@/components/status-timeline"
import { useAppState } from "@/lib/app-state-context"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

import { getMyStartup, updateMyStartup } from "@/app/actions/startup"
import { Loader2Icon } from "lucide-react"

export default function StartupPage() {
  const [currentStartup, setCurrentStartup] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  const [documents, setDocuments] = React.useState<string[]>([])
  const [isUploading, setIsUploading] = React.useState(false)

  // Edit details states (simulated)
  const [isEditing, setIsEditing] = React.useState(false)
  const [tagline, setTagline] = React.useState("")
  const [problem, setProblem] = React.useState("")
  const [solution, setSolution] = React.useState("")

  // Asset states
  const [pitchDeck, setPitchDeck] = React.useState("")
  const [website, setWebsite] = React.useState("")
  const [demoVideo, setDemoVideo] = React.useState("")

  const docFileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    loadStartup()
  }, [])

  const loadStartup = async () => {
    setLoading(true)
    const res = await getMyStartup()
    if (res.startup) {
      setCurrentStartup(res.startup)
      setTagline(res.startup.tagline || "")
      setProblem(res.startup.problem || "")
      setSolution(res.startup.solution || "")
      setDocuments(res.startup.attachments?.documents || [])
      setPitchDeck(res.startup.attachments?.pitchDeck || "")
      setWebsite(res.startup.attachments?.website || "")
      setDemoVideo(res.startup.attachments?.demoVideo || "")
    }
    setLoading(false)
  }

  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setTimeout(async () => {
      const updatedDocs = [...documents, file.name]
      const res = await updateMyStartup({
        attachments: {
          ...currentStartup.attachments,
          documents: updatedDocs,
        }
      })
      if (!res.error) {
        setDocuments(updatedDocs)
        setCurrentStartup((prev: any) => ({
          ...prev,
          attachments: { ...prev.attachments, documents: updatedDocs }
        }))
        toast.success(`Document "${file.name}" uploaded successfully.`)
      } else {
        toast.error("Failed to upload document")
      }
      setIsUploading(false)
      if (docFileInputRef.current) docFileInputRef.current.value = ""
    }, 1000)
  }

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    
    toast.info("Saving details...")
    const res = await updateMyStartup({
      tagline,
      problem,
      solution,
      attachments: {
        ...currentStartup.attachments,
        pitchDeck: pitchDeck || undefined,
        website: website || undefined,
        demoVideo: demoVideo || undefined,
      }
    })

    if (res.error) {
      toast.error(res.error)
    } else {
      setIsEditing(false)
      toast.success("Startup details updated successfully.")
      loadStartup()
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2Icon className="animate-spin text-muted-foreground size-8" />
      </div>
    )
  }

  if (!currentStartup) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center text-center max-w-sm mx-auto">
        <RocketIcon className="size-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Startup Found</h2>
        <p className="text-muted-foreground mb-6 text-sm">You haven't created or joined a startup team yet. Head over to Team Connect to get started.</p>
        <Button onClick={() => window.location.href = "/team"}>Go to Team Connect</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{currentStartup.name}</h1>
            <StatusBadge status={currentStartup.status} />
          </div>
          <p className="text-sm text-muted-foreground">{tagline}</p>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)} variant="outline" size="sm" className="gap-1.5 self-start">
          <Edit2Icon className="size-3.5" />
          {isEditing ? "Cancel editing" : "Edit Pitch"}
        </Button>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left main content columns */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Edit Startup Pitch</CardTitle>
                <CardDescription>Update your core value propositions for EDC review.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveDetails}>
                  <FieldGroup className="gap-4">
                    <Field>
                      <FieldLabel htmlFor="editTagline">One-liner Tagline</FieldLabel>
                      <Input
                        id="editTagline"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="editProblem">Problem Statement</FieldLabel>
                      <Textarea
                        id="editProblem"
                        rows={3}
                        value={problem}
                        onChange={(e) => setProblem(e.target.value)}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="editSolution">Proposed Solution</FieldLabel>
                      <Textarea
                        id="editSolution"
                        rows={3}
                        value={solution}
                        onChange={(e) => setSolution(e.target.value)}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="editPitchDeck">Pitch Deck File Name</FieldLabel>
                      <Input
                        id="editPitchDeck"
                        placeholder="e.g. LoopLearn-Pitch-v3.pdf"
                        value={pitchDeck}
                        onChange={(e) => setPitchDeck(e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="editWebsite">Website URL</FieldLabel>
                      <Input
                        id="editWebsite"
                        placeholder="https://..."
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="editDemoVideo">Demo Video URL</FieldLabel>
                      <Input
                        id="editDemoVideo"
                        placeholder="https://..."
                        value={demoVideo}
                        onChange={(e) => setDemoVideo(e.target.value)}
                      />
                    </Field>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Pitch</Button>
                    </div>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Value Proposition</CardTitle>
                <CardDescription>Core details submitted in the application.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-foreground">The Problem</span>
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{problem}</p>
                </div>
                <Separator />
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-foreground">Our Solution</span>
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{solution}</p>
                </div>
                <Separator />
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-foreground">Target Customer Base</span>
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                    {currentStartup.targetCustomers}
                  </p>
                </div>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-xs text-muted-foreground block">Business Model</span>
                    <span className="text-sm font-medium mt-0.5 block">{currentStartup.businessModel}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Revenue Stream</span>
                    <span className="text-sm font-medium mt-0.5 block">{currentStartup.revenueModel}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Members Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UsersIcon className="size-4 text-primary" />
                Founding Team ({currentStartup.teamMembers.length})
              </CardTitle>
              <CardDescription>Registered members of the venture.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {currentStartup.teamMembers.map((member) => (
                  <div key={member.name} className="flex flex-col gap-1 p-3 rounded-lg border bg-muted/20">
                    <span className="text-sm font-medium text-foreground">{member.name}</span>
                    <span className="text-xs text-muted-foreground">{member.role}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side navigation panels */}
        <div className="flex flex-col gap-6">
          {/* Status timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Application Progress</CardTitle>
              <CardDescription>Incubation pipeline stage.</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusTimeline current={currentStartup.status} />
            </CardContent>
          </Card>

          {/* Attachments & Files */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pitch Deck & Links</CardTitle>
              <CardDescription>Upload decks, video demos, or documents.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {currentStartup.attachments.pitchDeck && (
                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/10 text-sm">
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="size-4 text-primary shrink-0" />
                    <span className="font-medium truncate max-w-[150px]">{currentStartup.attachments.pitchDeck}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    Download
                    <ArrowUpRightIcon className="size-3" />
                  </Button>
                </div>
              )}

              {currentStartup.attachments.website && (
                <a
                  href={currentStartup.attachments.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/10 text-sm hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <GlobeIcon className="size-4 text-primary shrink-0" />
                    <span className="font-medium truncate max-w-[150px]">Website</span>
                  </div>
                  <ArrowUpRightIcon className="size-3 text-muted-foreground" />
                </a>
              )}

              {currentStartup.attachments.demoVideo && (
                <a
                  href={currentStartup.attachments.demoVideo}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/10 text-sm hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <VideoIcon className="size-4 text-primary shrink-0" />
                    <span className="font-medium truncate max-w-[150px]">Demo Video</span>
                  </div>
                  <ArrowUpRightIcon className="size-3 text-muted-foreground" />
                </a>
              )}

              <Separator />

              {/* Uploaded Documents List */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Other Documents</span>
                {(!documents || documents.length === 0) ? (
                  <p className="text-xs text-muted-foreground italic">No additional files uploaded.</p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {documents.map((doc, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-foreground p-1">
                        <LinkIcon className="size-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{doc}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Upload form */}
              <div className="mt-2">
                <input
                  type="file"
                  ref={docFileInputRef}
                  onChange={handleDocFileChange}
                  style={{ display: "none" }}
                />
                <Button
                  onClick={() => docFileInputRef.current?.click()}
                  className="w-full text-xs gap-1.5 h-8"
                  disabled={isUploading}
                  variant="outline"
                >
                  {isUploading ? (
                    "Uploading..."
                  ) : (
                    <>
                      <PlusIcon className="size-3.5" />
                      Upload Document File
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
