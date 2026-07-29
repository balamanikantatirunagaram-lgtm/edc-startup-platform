"use client"

import * as React from "react"
import { getMyStartup, updateMyStartup } from "@/app/actions/startup"
import { getTeamTasks, createTask, updateTaskStatus } from "@/app/actions/tasks"
import { getMyTeamStatus, getTeamRequests, handleTeamRequest, searchStudentsByNiat, inviteStudent, removeTeamMember } from "@/app/actions/team"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2Icon, RocketIcon, UsersIcon, ListTodoIcon, SearchIcon, SendIcon, CheckIcon, XIcon, UserMinusIcon, TrashIcon } from "lucide-react"
import QRCode from "react-qr-code"

export default function StartupCommandCenter() {
  const [loading, setLoading] = React.useState(true)
  const [status, setStatus] = React.useState<any>(null)
  
  // Portfolio States
  const [currentStartup, setCurrentStartup] = React.useState<any>(null)
  const [isEditing, setIsEditing] = React.useState(false)
  const [portfolioData, setPortfolioData] = React.useState<any>({})

  // Team Mgmt States
  const [requests, setRequests] = React.useState<any[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<any[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const [inviting, setInviting] = React.useState<string | null>(null)
  const [removing, setRemoving] = React.useState<string | null>(null)

  // Task States
  const [tasks, setTasks] = React.useState<any[]>([])
  const [newTaskTitle, setNewTaskTitle] = React.useState("")
  const [newTaskDesc, setNewTaskDesc] = React.useState("")
  const [newTaskAssignee, setNewTaskAssignee] = React.useState("")
  const [isCreatingTask, setIsCreatingTask] = React.useState(false)

  React.useEffect(() => {
    loadEverything()
  }, [])

  const loadEverything = async () => {
    setLoading(true)
    const tStatus = await getMyTeamStatus()
    setStatus(tStatus)

    if (tStatus.hasTeam) {
      const [startupRes, reqsRes, tasksRes] = await Promise.all([
        getMyStartup(),
        tStatus.isLeader ? getTeamRequests() : Promise.resolve({ requests: [] }),
        getTeamTasks()
      ])

      if (startupRes.startup) {
        setCurrentStartup(startupRes.startup)
        setPortfolioData({
          tagline: startupRes.startup.tagline || "",
          problem: startupRes.startup.problem || "",
          solution: startupRes.startup.solution || "",
          pitchDeck: startupRes.startup.attachments?.pitchDeck || "",
          website: startupRes.startup.attachments?.website || "",
        })
      }
      
      if (reqsRes.requests) setRequests(reqsRes.requests)
      if (tasksRes.tasks) setTasks(tasksRes.tasks)
    }
    
    setLoading(false)
  }

  // --- PORTFOLIO LOGIC ---
  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault()
    toast.info("Saving details...")
    const res = await updateMyStartup({
      tagline: portfolioData.tagline,
      problem: portfolioData.problem,
      solution: portfolioData.solution,
      attachments: {
        ...currentStartup.attachments,
        pitchDeck: portfolioData.pitchDeck || undefined,
        website: portfolioData.website || undefined,
      }
    })

    if (res.error) {
      toast.error(res.error)
    } else {
      setIsEditing(false)
      toast.success("Startup details updated successfully.")
      loadEverything() // Refresh data
    }
  }

  // --- TEAM LOGIC ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setIsSearching(true)
    const res = await searchStudentsByNiat(searchQuery)
    setSearchResults(res.users || [])
    setIsSearching(false)
  }

  const handleInvite = async (studentNiat: string) => {
    setInviting(studentNiat)
    const res = await inviteStudent(studentNiat, status.team.id)
    setInviting(null)
    if (res.error) toast.error(res.error)
    else {
      toast.success("Invite sent successfully!")
      setSearchResults(prev => prev.filter(u => u.id !== studentNiat))
    }
  }

  const handleRequestAction = async (id: string, action: 'approved' | 'rejected') => {
    const res = await handleTeamRequest(id, action)
    if (res.error) toast.error(res.error)
    else {
      toast.success(`Request ${action}.`)
      setRequests(prev => prev.filter(r => r.id !== id))
      if (action === 'approved') loadEverything() // Refresh members
    }
  }

  const handleRemoveMember = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return
    setRemoving(studentId)
    const res = await removeTeamMember(studentId, status.team.id)
    setRemoving(null)
    if (res.error) toast.error(res.error)
    else {
      toast.success("Member removed.")
      loadEverything()
    }
  }

  // --- TASK LOGIC ---
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle || !newTaskAssignee) return
    setIsCreatingTask(true)
    const res = await createTask(newTaskTitle, newTaskDesc, newTaskAssignee)
    setIsCreatingTask(false)
    if (res.error) toast.error(res.error)
    else {
      toast.success("Task assigned.")
      setNewTaskTitle("")
      setNewTaskDesc("")
      setNewTaskAssignee("")
      loadEverything()
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const res = await updateTaskStatus(taskId, newStatus)
    if (res.error) toast.error(res.error)
    else {
      toast.success("Task updated.")
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2Icon className="animate-spin text-muted-foreground size-8" />
      </div>
    )
  }

  if (!status?.hasTeam || !currentStartup) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center text-center max-w-sm mx-auto">
        <RocketIcon className="size-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Startup Found</h2>
        <p className="text-muted-foreground mb-6 text-sm">You haven't created or joined a startup team yet. Head over to Team Connect to get started.</p>
        <Button onClick={() => window.location.href = "/team"}>Go to Team Connect</Button>
      </div>
    )
  }

  const isLeader = status.isLeader

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto mt-6 px-4 pb-20 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{currentStartup.name}</h1>
          <p className="text-muted-foreground">{currentStartup.tagline || "No tagline set."}</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-mono font-bold tracking-widest border border-primary/20">
          TEAM CODE: {status.team.code}
        </div>
      </div>

      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="portfolio" className="h-full gap-2"><RocketIcon className="size-4" /> Portfolio</TabsTrigger>
          <TabsTrigger value="team" className="h-full gap-2"><UsersIcon className="size-4" /> Team & Invites</TabsTrigger>
          <TabsTrigger value="tasks" className="h-full gap-2"><ListTodoIcon className="size-4" /> Tasks</TabsTrigger>
        </TabsList>

        {/* PORTFOLIO TAB */}
        <TabsContent value="portfolio" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Startup Profile</CardTitle>
                <CardDescription>Your startup's core identity and details.</CardDescription>
              </div>
              {isLeader && (
                <Button variant={isEditing ? "destructive" : "outline"} onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? "Cancel Edit" : "Edit Details"}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form id="portfolio-form" onSubmit={handleSavePortfolio} className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Tagline</Label>
                    <Input value={portfolioData.tagline} onChange={e => setPortfolioData({...portfolioData, tagline: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Problem Statement</Label>
                    <Textarea className="min-h-[100px]" value={portfolioData.problem} onChange={e => setPortfolioData({...portfolioData, problem: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Proposed Solution</Label>
                    <Textarea className="min-h-[100px]" value={portfolioData.solution} onChange={e => setPortfolioData({...portfolioData, solution: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Pitch Deck URL</Label>
                    <Input value={portfolioData.pitchDeck} onChange={e => setPortfolioData({...portfolioData, pitchDeck: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Website URL</Label>
                    <Input value={portfolioData.website} onChange={e => setPortfolioData({...portfolioData, website: e.target.value})} />
                  </div>
                  <Button type="submit" className="mt-4">Save Changes</Button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">Problem Statement</h3>
                    <p className="text-sm bg-muted/30 p-3 rounded-md">{currentStartup.problem || "Not provided."}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">Proposed Solution</h3>
                    <p className="text-sm bg-muted/30 p-3 rounded-md">{currentStartup.solution || "Not provided."}</p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {currentStartup.attachments?.pitchDeck && (
                      <Button variant="outline" asChild><a href={currentStartup.attachments.pitchDeck} target="_blank">View Pitch Deck</a></Button>
                    )}
                    {currentStartup.attachments?.website && (
                      <Button variant="outline" asChild><a href={currentStartup.attachments.website} target="_blank">Visit Website</a></Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TEAM TAB */}
        <TabsContent value="team" className="mt-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Current roster for {currentStartup.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStartup.teamMembers.map((m: any) => (
                  <div key={m.id} className="flex justify-between items-center p-3 border rounded-lg bg-card">
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.role}</p>
                    </div>
                    {isLeader && m.role !== 'Team Leader' && (
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" disabled={removing === m.id} onClick={() => handleRemoveMember(m.id)}>
                        {removing === m.id ? <Loader2Icon className="size-4 animate-spin" /> : <UserMinusIcon className="size-4" />}
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recruit</CardTitle>
                <CardDescription>Let others scan this QR to request to join.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl border">
                  <QRCode value={status.team.code} size={150} />
                </div>
              </CardContent>
            </Card>
          </div>

          {isLeader && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Invite Students</CardTitle>
                  <CardDescription>Search by Name or NIAT ID to send direct invites.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <Input placeholder="Enter Name or NIAT ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <Button type="submit" disabled={isSearching}>
                      {isSearching ? <Loader2Icon className="size-4 animate-spin" /> : <SearchIcon className="size-4" />}
                    </Button>
                  </form>
                  {searchResults.length > 0 && (
                    <div className="mt-4 flex flex-col gap-2">
                      {searchResults.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.id}</span>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleInvite(user.id)} disabled={inviting === user.id}>
                            {inviting === user.id ? <Loader2Icon className="size-4 animate-spin" /> : <SendIcon className="size-4 mr-2" />}
                            Invite
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Join Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {requests.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No pending requests.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {requests.map(req => (
                        <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">{req.studentName}</p>
                            <p className="text-xs text-muted-foreground">Requested {new Date(req.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleRequestAction(req.id, 'rejected')}>Reject</Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleRequestAction(req.id, 'approved')}>Approve</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* TASKS TAB */}
        <TabsContent value="tasks" className="mt-6 space-y-6">
          {isLeader && (
            <Card>
              <CardHeader>
                <CardTitle>Assign New Task</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="grid gap-2 md:col-span-2">
                    <Label>Task Title</Label>
                    <Input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required placeholder="E.g., Complete Pitch Deck" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Assignee</Label>
                    <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee} required>
                      <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                      <SelectContent>
                        {currentStartup.teamMembers.map((m: any) => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={isCreatingTask}>
                    {isCreatingTask ? "Assigning..." : "Assign Task"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            <h3 className="font-semibold text-lg">Current Tasks</h3>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks assigned yet.</p>
            ) : (
              tasks.map(task => {
                const assignee = currentStartup.teamMembers.find((m: any) => m.id === task.assigned_to)
                return (
                  <Card key={task.id} className={task.status === 'completed' ? 'opacity-60 bg-muted/50' : ''}>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <p className={`font-medium ${task.status === 'completed' ? 'line-through' : ''}`}>{task.title}</p>
                        <p className="text-xs text-muted-foreground">Assigned to: {assignee?.name || 'Unknown'}</p>
                      </div>
                      <Select 
                        value={task.status} 
                        onValueChange={(val) => handleStatusChange(task.id, val)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
