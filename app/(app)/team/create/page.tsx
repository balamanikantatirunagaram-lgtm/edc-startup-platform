"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { createTeam } from "@/app/actions/team"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Rocket, Target, Lightbulb, CheckCircle2 } from "lucide-react"

export default function CreateTeamPage() {
  const [loading, setLoading] = useState(false)
  const [teamData, setTeamData] = useState<{ id: string, name: string, code: string } | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    teamName: "",
    startupName: "",
    problem_statement: "",
    proposed_solution: "",
    stage: "",
    industry: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await createTeam(formData)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else if (res.team) {
      toast.success("Team and Startup created successfully!")
      setTeamData(res.team)
    }
  }

  if (teamData) {
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto mt-10">
        <h1 className="text-2xl font-semibold tracking-tight text-center">Your Team is Ready!</h1>
        <Card>
          <CardHeader>
            <CardTitle>{teamData.name}</CardTitle>
            <CardDescription>Share this code or QR code with your friends so they can join your team.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="p-4 bg-muted rounded-xl flex flex-col items-center gap-2">
              <span className="text-sm font-medium uppercase text-muted-foreground">Team Invite Code</span>
              <span className="text-4xl font-bold tracking-widest">{teamData.code}</span>
            </div>
            
            <div className="bg-white p-4 rounded-xl">
              <QRCode value={teamData.code} size={200} />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/team/manage")}>
              Go to Team Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10 mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Register Startup & Create Team</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Register for the startup series and create your team simultaneously. As the team leader, you'll be able to invite members and manage the application.
        </p>
      </div>

      <form onSubmit={handleCreate}>
        <div className="grid gap-8">
          
          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                <CardTitle>Team & Startup Basics</CardTitle>
              </div>
              <CardDescription>Give your team and startup an identity.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input 
                    id="teamName" 
                    name="teamName" 
                    placeholder="e.g. Innovators Inc." 
                    required 
                    value={formData.teamName}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startupName">Startup Name</Label>
                  <Input 
                    id="startupName" 
                    name="startupName" 
                    placeholder="e.g. Acme Corp" 
                    required 
                    value={formData.startupName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="stage">Current Stage</Label>
                  <Select required onValueChange={(val) => handleSelectChange('stage', val as string)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Idea">Idea</SelectItem>
                      <SelectItem value="Prototype">Prototype</SelectItem>
                      <SelectItem value="MVP">MVP</SelectItem>
                      <SelectItem value="Traction">Traction</SelectItem>
                      <SelectItem value="Scaling">Scaling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select required onValueChange={(val) => handleSelectChange('industry', val as string)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="E-commerce">E-commerce</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>The Problem</CardTitle>
              </div>
              <CardDescription>What specific problem are you trying to solve?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="problem_statement">Problem Statement</Label>
                <Textarea 
                  id="problem_statement" 
                  name="problem_statement" 
                  placeholder="Describe the problem you've identified in the market..." 
                  className="min-h-[120px] resize-y"
                  required
                  value={formData.problem_statement}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <CardTitle>The Solution</CardTitle>
              </div>
              <CardDescription>How does your startup solve this problem?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="proposed_solution">Proposed Solution</Label>
                <Textarea 
                  id="proposed_solution" 
                  name="proposed_solution" 
                  placeholder="Explain your product or service and how it addresses the problem..." 
                  className="min-h-[120px] resize-y"
                  required
                  value={formData.proposed_solution}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto min-w-[200px] h-12 text-base font-medium">
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Register & Create Team
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
