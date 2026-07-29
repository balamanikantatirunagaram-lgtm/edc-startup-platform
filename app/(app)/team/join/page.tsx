"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { joinTeam } from "@/app/actions/team"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QRScanner } from "@/components/qr-scanner"

export default function JoinTeamPage() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleJoin = async (teamCode: string) => {
    if (!teamCode || teamCode.length < 5) return
    
    setLoading(true)
    const res = await joinTeam(teamCode)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else if (res.success) {
      toast.success(`Join request sent to ${res.teamName}!`)
      router.push("/dashboard")
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleJoin(code)
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-semibold tracking-tight">Join a Team</h1>
      <p className="text-sm text-muted-foreground">
        Enter a 5-digit invite code or scan a QR code from a team leader to join their startup team.
      </p>

      <Card>
        <CardContent className="pt-6">
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
                    className="text-xl tracking-widest uppercase font-mono"
                  />
                </div>
                <Button type="submit" disabled={loading || code.length < 5} className="w-full mt-2">
                  {loading ? "Sending Request..." : "Request to Join"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="scan">
              <div className="flex flex-col gap-4 items-center">
                <p className="text-sm text-center text-muted-foreground mb-2">
                  Point your camera at the team's QR code.
                </p>
                <QRScanner 
                  onScanSuccess={(decodedText) => {
                    setCode(decodedText)
                    toast.info(`Scanned code: ${decodedText}. Sending request...`)
                    handleJoin(decodedText)
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
