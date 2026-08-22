"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { joinTeam, getMyTeamStatus, getMyInvitations, respondToInvitation, getMyPendingRequests } from "@/services/team.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QRScanner } from "@/components/shared/QrScanner"
import {
  Loader2Icon,
  CheckIcon,
  XIcon,
  HandshakeIcon,
  KeyRoundIcon,
  SendIcon,
  UserCheckIcon,
  ClockIcon,
} from "lucide-react"

const HOW_IT_WORKS = [
  { icon: KeyRoundIcon, title: "Get the code", desc: "Ask a team leader for their 5-digit code or scan their QR." },
  { icon: SendIcon, title: "Send request", desc: "Enter the code below and request to join their startup." },
  { icon: UserCheckIcon, title: "Leader approves", desc: "Once approved, your team's startup dashboard unlocks." },
]

export default function TeamConnectPage() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(true)
  const [invitations, setInvitations] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    // If user already has a team, redirect to startup dashboard
    getMyTeamStatus().then(res => {
      if (res.hasTeam) {
        router.replace("/startup")
      } else {
        setStatusLoading(false)
        loadData()
      }
    })
  }, [router])

  const loadData = async () => {
    const [invRes, pendRes] = await Promise.all([
      getMyInvitations(),
      getMyPendingRequests()
    ])
    if (invRes.invitations) setInvitations(invRes.invitations)
    if (pendRes.requests) setPendingRequests(pendRes.requests)
  }

  const handleJoin = async (teamCode: string) => {
    if (!teamCode || teamCode.length < 5) return

    setLoading(true)
    const res = await joinTeam(teamCode)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else if (res.success) {
      toast.success(`Join request sent to ${res.teamName}!`)
      loadData()
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleJoin(code)
  }

  const handleInviteResponse = async (id: string, action: 'approved' | 'rejected') => {
    toast.info("Processing...")
    const res = await respondToInvitation(id, action)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(action === 'approved' ? "Welcome to the team!" : "Invitation declined.")
      if (action === 'approved') {
        router.push("/startup")
      } else {
        setInvitations(prev => prev.filter(inv => inv.id !== id))
      }
    }
  }

  if (statusLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto mt-6 w-full px-4 pb-20">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 sm:p-8">
        <div className="pointer-events-none absolute -top-24 right-0 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25">
                <HandshakeIcon className="size-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Team Connect</h1>
                <p className="mt-0.5 text-sm text-muted-foreground">Join an existing startup team or create your own.</p>
              </div>
            </div>
            <Button onClick={() => router.push("/startup/register")} className="shrink-0 shadow-md">
              Create New Team
            </Button>
          </div>

          {/* How it works */}
          <div className="grid gap-3 pt-1 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border bg-card/70 p-3 backdrop-blur-sm">
                <div className="relative shrink-0">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <step.icon className="size-4" />
                  </div>
                  <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold">{step.title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INVITATIONS */}
      {invitations.length > 0 && (
        <Card className="border-primary/30 shadow-sm">
          <CardHeader>
            <CardTitle>Your Invitations</CardTitle>
            <CardDescription>Team leaders have invited you to join their startups.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {invitations.map(inv => (
              <div key={inv.id} className="group flex items-center justify-between gap-3 p-3.5 rounded-xl border bg-card transition-colors hover:border-primary/30 hover:bg-muted/20">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-sm font-bold text-primary-foreground">
                    {inv.teamName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate font-semibold">{inv.teamName}</span>
                    <span className="text-xs text-muted-foreground">Invited on {new Date(inv.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" onClick={() => handleInviteResponse(inv.id, 'rejected')}>
                    <XIcon className="size-4" /> Decline
                  </Button>
                  <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleInviteResponse(inv.id, 'approved')}>
                    <CheckIcon className="size-4" /> Approve
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* PENDING REQUESTS */}
      {pendingRequests.length > 0 && (
        <Card className="border-orange-500/30 shadow-sm">
          <CardHeader>
            <CardTitle>Pending Join Requests</CardTitle>
            <CardDescription>You have requested to join these teams.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {pendingRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between gap-3 p-3.5 rounded-xl border bg-card">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                    {req.teamName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate font-semibold">{req.teamName}</span>
                    <span className="text-xs text-muted-foreground">Requested on {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300">
                  <ClockIcon className="size-3" /> Awaiting Approval
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* JOIN CARD */}
      <Card>
        <CardHeader>
          <CardTitle>Request to Join</CardTitle>
          <CardDescription>Scan a QR or enter a 5-digit code provided by a team leader.</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <Tabs defaultValue="code" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 rounded-full p-1 h-auto">
              <TabsTrigger value="code" className="rounded-full py-1.5">Enter Code</TabsTrigger>
              <TabsTrigger value="scan" className="rounded-full py-1.5">Scan QR</TabsTrigger>
            </TabsList>

            <TabsContent value="code">
              <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="code">5-Digit Team Code</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 5))}
                    placeholder="e.g. 84210"
                    required
                    maxLength={5}
                    className="text-3xl tracking-[0.5em] uppercase font-mono text-center h-16 font-bold focus-visible:ring-primary/40"
                  />
                </div>
                <Button type="submit" size="lg" disabled={loading || code.length < 5} className="w-full mt-2">
                  {loading ? <Loader2Icon className="animate-spin size-4 mr-2" /> : <SendIcon className="size-4 mr-2" />}
                  {loading ? "Sending Request..." : "Send Request"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="scan">
              <div className="flex flex-col gap-4 items-center">
                <p className="text-sm text-center text-muted-foreground mb-2">
                  Point your camera at the team's QR code.
                </p>
                <div className="overflow-hidden rounded-xl border-2 border-primary/20 p-2">
                  <QRScanner
                    onScanSuccess={(decodedText) => {
                      setCode(decodedText)
                      toast.info(`Scanned code: ${decodedText}. Sending request...`)
                      handleJoin(decodedText)
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
