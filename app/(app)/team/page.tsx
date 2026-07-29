"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { joinTeam, getMyTeamStatus, getMyInvitations, respondToInvitation } from "@/app/actions/team"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QRScanner } from "@/components/qr-scanner"
import { Loader2Icon, CheckIcon, XIcon } from "lucide-react"

export default function TeamConnectPage() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(true)
  const [invitations, setInvitations] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    // If user already has a team, redirect to startup dashboard
    getMyTeamStatus().then(res => {
      if (res.hasTeam) {
        router.replace("/startup")
      } else {
        setStatusLoading(false)
        loadInvitations()
      }
    })
  }, [router])

  const loadInvitations = async () => {
    const res = await getMyInvitations()
    if (res.invitations) {
      setInvitations(res.invitations)
    }
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
    <div className="flex flex-col gap-8 max-w-2xl mx-auto mt-10 w-full px-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Team Connect</h1>
        <p className="text-muted-foreground">
          You don't have a team yet. Enter a code to request access, or check your pending invitations.
        </p>
      </div>

      {invitations.length > 0 && (
        <Card className="border-primary/30 shadow-sm">
          <CardHeader>
            <CardTitle>Your Invitations</CardTitle>
            <CardDescription>Team leaders have invited you to join their startups.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {invitations.map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl border bg-card">
                <div className="flex flex-col">
                  <span className="font-medium text-lg">{inv.teamName}</span>
                  <span className="text-xs text-muted-foreground">Invited on {new Date(inv.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" onClick={() => handleInviteResponse(inv.id, 'rejected')}>
                    <XIcon className="size-4" />
                  </Button>
                  <Button variant="default" size="icon" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleInviteResponse(inv.id, 'approved')}>
                    <CheckIcon className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Request to Join</CardTitle>
          <CardDescription>Scan a QR or enter a 5-digit code provided by a team leader.</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <Tabs defaultValue="code" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="code">Enter Code</TabsTrigger>
              <TabsTrigger value="scan">Scan QR</TabsTrigger>
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
                    className="text-2xl tracking-[0.5em] uppercase font-mono text-center h-16"
                  />
                </div>
                <Button type="submit" size="lg" disabled={loading || code.length < 5} className="w-full mt-2">
                  {loading ? <Loader2Icon className="animate-spin size-4 mr-2" /> : null}
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
