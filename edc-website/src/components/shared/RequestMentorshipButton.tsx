"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cancelMentorshipRequest, requestMentorship } from "@/services/mentorship.service"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2Icon, CheckCheckIcon, ClockIcon, ArrowRightIcon } from "lucide-react"

export type MentorRequestState = "none" | "pending" | "accepted" | "declined"

export function RequestMentorshipButton({
  mentorId,
  initialState = "none",
}: {
  mentorId: string
  initialState?: MentorRequestState
}) {
  const [state, setState] = React.useState<MentorRequestState>(initialState)
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [cancelling, setCancelling] = React.useState(false)
  const [topic, setTopic] = React.useState("")
  const [description, setDescription] = React.useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await requestMentorship(mentorId, topic, description)
    setLoading(false)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success(res.reactivated ? "Request re-sent!" : "Mentorship request sent successfully!")
    setOpen(false)
    setTopic("")
    setDescription("")
    setState("pending")
  }

  async function onCancel() {
    if (!confirm("Cancel this pending request?")) return
    // The parent passes mentorId; we need the request id — fetch list to resolve it.
    const { getMyMentorshipRequests } = await import("@/services/mentorship.service")
    const res = await getMyMentorshipRequests()
    const mine = res.requests?.find((r: any) => r.mentor_id === mentorId && r.status === "pending")
    if (!mine) {
      toast.error("Pending request not found.")
      return
    }
    setCancelling(true)
    const del = await cancelMentorshipRequest(mine.id)
    setCancelling(false)
    if (del.error) {
      toast.error(del.error)
      return
    }
    toast.success("Request cancelled.")
    setState("none")
  }

  if (state === "accepted") {
    return (
      <Button className="w-full gap-2" render={<Link href={`/startup/messages/${mentorId}`} />}>
        <CheckCheckIcon className="size-4" /> Open Workspace
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
    )
  }

  if (state === "pending") {
    return (
      <div className="flex flex-col gap-1.5">
        <Button variant="secondary" disabled className="w-full gap-2">
          <ClockIcon className="size-4" /> Request sent…
        </Button>
        <Button variant="ghost" size="sm" disabled={cancelling} onClick={onCancel} className="text-muted-foreground hover:text-destructive">
          {cancelling ? <Loader2Icon className="size-3 animate-spin" /> : null}
          Cancel request
        </Button>
      </div>
    )
  }

  const label = state === "declined" ? "Request Again" : "Request Mentorship"
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="w-full gap-2" variant={state === "declined" ? "outline" : "default"} />}>
        {label}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              Tell this mentor what you would like help with.
              {state === "declined" ? " Your previous request was declined." : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="topic">Topic</Label>
              <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Go-to-market strategy" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Details</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does your team need most right now?" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2Icon className="size-4 animate-spin mr-2" /> : null}
              Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
