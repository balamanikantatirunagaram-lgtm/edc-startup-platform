"use client"

import * as React from "react"
import { getMentorshipEngagements, revokeMentorship } from "@/services/mentorship.service"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2Icon, MessageSquareIcon, BanIcon, ActivityIcon, UsersIcon, CheckCircleIcon } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminMentorshipsPage() {
  const [engagements, setEngagements] = React.useState<any[]>([])
  const [metrics, setMetrics] = React.useState<any>({})
  const [loading, setLoading] = React.useState(true)
  
  const [selectedEngagement, setSelectedEngagement] = React.useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [revoking, setRevoking] = React.useState<string | null>(null)

  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const res = await getMentorshipEngagements()
    if (res.success) {
      setEngagements(res.engagements)
      setMetrics(res.metrics)
    } else {
      toast.error(res.error || "Failed to load data")
    }
    setLoading(false)
  }

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this mentorship connection?")) return
    setRevoking(id)
    const res = await revokeMentorship(id)
    if (res.success) {
      toast.success("Mentorship revoked.")
      setIsDialogOpen(false)
      loadData()
    } else {
      toast.error(res.error || "Failed to revoke.")
    }
    setRevoking(null)
  }

  const openAudit = (e: any) => {
    setSelectedEngagement(e)
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2Icon className="animate-spin text-muted-foreground size-8" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mentorship Oversight</h1>
          <p className="text-sm text-muted-foreground">Monitor and manage active mentorship engagements.</p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <ActivityIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPending || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting mentor approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Mentorships</CardTitle>
            <CheckCircleIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalActive || 0}</div>
            <p className="text-xs text-muted-foreground">Currently paired</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <MessageSquareIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalMessages || 0}</div>
            <p className="text-xs text-muted-foreground">Across all chat rooms</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mentorship Engagements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {engagements.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic text-sm">
              No mentorship engagements found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                    <th className="p-4">Startup</th>
                    <th className="p-4">Mentor</th>
                    <th className="p-4">Topic</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {engagements.map((eng) => (
                    <tr key={eng.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-medium">{eng.teamName}</td>
                      <td className="p-4 text-muted-foreground">{eng.mentorName}</td>
                      <td className="p-4 max-w-[200px] truncate">{eng.topic}</td>
                      <td className="p-4">
                        <Badge variant={
                          eng.status === 'accepted' ? 'default' :
                          eng.status === 'declined' ? 'destructive' : 'secondary'
                        }>
                          {eng.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => openAudit(eng)}>
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedEngagement && (
            <>
              <DialogHeader>
                <DialogTitle>Mentorship Audit View</DialogTitle>
                <DialogDescription>
                  Detailed logs for the connection between {selectedEngagement.teamName} and {selectedEngagement.mentorName}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col gap-1 border p-3 rounded-lg bg-muted/20">
                    <span className="font-semibold text-muted-foreground">Startup</span>
                    <span>{selectedEngagement.teamName}</span>
                  </div>
                  <div className="flex flex-col gap-1 border p-3 rounded-lg bg-muted/20">
                    <span className="font-semibold text-muted-foreground">Mentor</span>
                    <span>{selectedEngagement.mentorName}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Requested Topic</h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-md">{selectedEngagement.topic}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Original Description</h4>
                  <p className="text-sm text-muted-foreground border p-3 rounded-md">{selectedEngagement.description}</p>
                </div>

                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm flex items-center gap-2">
                      <MessageSquareIcon className="size-4" /> Activity Log
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {selectedEngagement.messageCount} messages exchanged in this room.
                    </span>
                  </div>
                  {selectedEngagement.status === 'accepted' && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      disabled={revoking === selectedEngagement.id}
                      onClick={() => handleRevoke(selectedEngagement.id)}
                    >
                      {revoking === selectedEngagement.id ? <Loader2Icon className="size-4 animate-spin mr-2" /> : <BanIcon className="size-4 mr-2" />}
                      Revoke Access
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
