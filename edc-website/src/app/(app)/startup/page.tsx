"use client"

import * as React from "react"
import { getMyStartup, updateMyStartup, deleteMyStartup, getStartupJourney } from "@/services/startup.service"
import { getTeamTasks, createTask, updateTaskStatus } from "@/services/tasks.service"
import { getMyTeamStatus, getTeamRequests, handleTeamRequest, searchStudentsByNiat, inviteStudent, removeTeamMember, leaveTeam } from "@/services/team.service"
import { getStartupApplications, updateApplicationStatus } from "@/services/jobs.service"
import { getMyMentorshipRequests } from "@/services/mentorship.service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Loader2Icon,
  RocketIcon,
  UsersIcon,
  ListTodoIcon,
  SearchIcon,
  SendIcon,
  CheckIcon,
  XIcon,
  TrashIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  RouteIcon,
  CopyIcon,
  QrCodeIcon,
  LinkIcon,
  FileTextIcon,
  GlobeIcon,
  VideoIcon,
  LightbulbIcon,
  TargetIcon,
  BanknoteIcon,
} from "lucide-react"
import QRCode from "react-qr-code"
import { StartupHero } from "@/components/startup/StartupHero"
import { StartupStats } from "@/components/startup/StartupStats"
import { JourneyTimeline } from "@/components/startup/JourneyTimeline"
import { TeamMemberCard } from "@/components/startup/TeamMemberCard"
import { TaskItem } from "@/components/startup/TaskItem"

const TASK_GROUPS = [
  { status: "pending", label: "Pending", icon: "bg-amber-500" },
  { status: "in_progress", label: "In Progress", icon: "bg-blue-500" },
  { status: "completed", label: "Completed", icon: "bg-green-500" },
]

export default function StartupCommandCenter() {
  const [loading, setLoading] = React.useState(true)
  const [status, setStatus] = React.useState<any>(null)

  // Portfolio States
  const [currentStartup, setCurrentStartup] = React.useState<any>(null)
  const [isEditing, setIsEditing] = React.useState(false)
  const [portfolioData, setPortfolioData] = React.useState<any>({})
  const [isDeleting, setIsDeleting] = React.useState(false)

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

  // Recruitment States
  const [applications, setApplications] = React.useState<any[]>([])
  const [updatingApp, setUpdatingApp] = React.useState<string | null>(null)

  // Mentor States
  const [mentorRequests, setMentorRequests] = React.useState<any[]>([])

  // Journey States
  const [journeyStages, setJourneyStages] = React.useState<any[]>([])

  React.useEffect(() => {
    loadEverything()
  }, [])

  // Auto-refresh join requests every 30 seconds for leaders
  React.useEffect(() => {
    if (!status?.isLeader) return
    const interval = setInterval(async () => {
      const reqsRes = await getTeamRequests()
      if (reqsRes.requests) setRequests(reqsRes.requests)
    }, 30000)
    return () => clearInterval(interval)
  }, [status?.isLeader])

  const loadEverything = async () => {
    setLoading(true)
    const tStatus = await getMyTeamStatus()
    setStatus(tStatus)

    if (tStatus?.hasTeam) {
      const startupRes = await getMyStartup()
      if (startupRes.startup) {
        setCurrentStartup(startupRes.startup)
        setPortfolioData({
          name: startupRes.startup.name,
          tagline: startupRes.startup.tagline || "",
          problem: startupRes.startup.problem || "",
          solution: startupRes.startup.solution || "",
          pitchDeck: startupRes.startup.attachments?.pitchDeck || "",
          website: startupRes.startup.attachments?.website || ""
        })

        // Fetch applications if leader
        if (tStatus.isLeader) {
          const appsRes = await getStartupApplications()
          if (appsRes.applications) setApplications(appsRes.applications)
        }
      }

      const tasksRes = await getTeamTasks()
      if (tasksRes.tasks) setTasks(tasksRes.tasks)

      if (tStatus.isLeader) {
        const reqsRes = await getTeamRequests()
        if (reqsRes.requests) setRequests(reqsRes.requests)
      }

      const mentorsRes = await getMyMentorshipRequests()
      if (mentorsRes.requests) setMentorRequests(mentorsRes.requests)

      if (startupRes.startup) {
        const journeyRes = await getStartupJourney()
        if (journeyRes.stages) setJourneyStages(journeyRes.stages)
      }
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

  const handleDeleteStartup = async () => {
    if (!confirm("WARNING: This will permanently delete your startup, all tasks, and disband your team. This action cannot be undone. Are you absolutely sure?")) return
    setIsDeleting(true)
    const res = await deleteMyStartup()
    setIsDeleting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Startup and team deleted.")
      window.location.href = "/team"
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

  const handleInvite = async (userId: string, niatId: string) => {
    setInviting(userId)
    const res = await inviteStudent(userId, status.team.id)
    setInviting(null)
    if (res.error) toast.error(res.error)
    else {
      toast.success("Invite sent successfully!")
      setSearchResults(prev => prev.filter((u: any) => u.userId !== userId))
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

  const handleLeaveTeam = async () => {
    if (!confirm("Are you sure you want to leave this team? Your open tasks will be reassigned to the leader.")) return
    const res = await leaveTeam()
    if (res.error) toast.error(res.error)
    else {
      toast.success("You left the team.")
      window.location.href = "/team"
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(status.team.code)
      toast.success("Team code copied!")
    } catch {
      toast.error("Could not copy code")
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

  // --- RECRUITMENT LOGIC ---
  const handleApplicationStatus = async (appId: string, newStatus: string) => {
    setUpdatingApp(appId)
    const res = await updateApplicationStatus(appId, newStatus)
    setUpdatingApp(null)
    if (res.error) toast.error(res.error)
    else {
      toast.success(`Application marked as ${newStatus}.`)
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app))
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
  const teamSize = currentStartup.teamMembers.length
  const doneTasks = tasks.filter(t => t.status === 'completed').length
  const assigneeName = (id: string) => currentStartup.teamMembers.find((m: any) => m.id === id)?.name

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto mt-6 px-4 pb-20 w-full">
      {/* HERO */}
      <StartupHero
        name={currentStartup.name}
        tagline={currentStartup.tagline}
        status={currentStartup.status}
        teamCode={status.team.code}
        teamSize={teamSize}
      />

      {/* STATS STRIP */}
      <StartupStats
        teamSize={teamSize}
        totalTasks={tasks.length}
        doneTasks={doneTasks}
        pendingRequests={isLeader ? requests.length : 0}
        mentorCount={mentorRequests.length}
      />

      <Tabs defaultValue="portfolio" className="w-full gap-6">
        <TabsList className="h-auto w-full justify-start gap-1 self-start overflow-x-auto rounded-full p-1 sm:w-fit">
          <TabsTrigger value="portfolio" className="flex-none rounded-full px-3.5 py-1.5 gap-1.5"><RocketIcon className="size-4 hidden sm:block" /> Portfolio</TabsTrigger>
          <TabsTrigger value="journey" className="flex-none rounded-full px-3.5 py-1.5 gap-1.5"><RouteIcon className="size-4 hidden sm:block" /> Journey</TabsTrigger>
          <TabsTrigger value="team" className="flex-none rounded-full px-3.5 py-1.5 gap-1.5">
            <UsersIcon className="size-4 hidden sm:block" /> Team
            {isLeader && requests.length > 0 && (
              <span className="ml-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {requests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex-none rounded-full px-3.5 py-1.5 gap-1.5"><ListTodoIcon className="size-4 hidden sm:block" /> Tasks</TabsTrigger>
          <TabsTrigger value="mentors" className="flex-none rounded-full px-3.5 py-1.5 gap-1.5">
            <GraduationCapIcon className="size-4 hidden sm:block" /> Mentors
          </TabsTrigger>
          {isLeader && (
            <TabsTrigger value="recruitment" className="flex-none rounded-full px-3.5 py-1.5 gap-1.5">
              <BriefcaseIcon className="size-4 hidden sm:block" /> Jobs
              {applications.filter(a => a.status === 'pending').length > 0 && (
                <span className="ml-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {applications.filter(a => a.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        {/* PORTFOLIO TAB */}
        <TabsContent value="portfolio" className="space-y-6">
          {isEditing ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Edit Startup Details</CardTitle>
                  <CardDescription>Update your startup's public profile.</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePortfolio} className="space-y-4">
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
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Pitch Deck URL</Label>
                      <Input value={portfolioData.pitchDeck} onChange={e => setPortfolioData({...portfolioData, pitchDeck: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Website URL</Label>
                      <Input value={portfolioData.website} onChange={e => setPortfolioData({...portfolioData, website: e.target.value})} />
                    </div>
                  </div>
                  <Button type="submit">Save Changes</Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>Startup Profile</CardTitle>
                    <CardDescription>Your startup's core identity and details.</CardDescription>
                  </div>
                  {isLeader && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit Details</Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-[1fr_260px]">
                    <div className="min-w-0 space-y-4">
                      <div className="rounded-xl border bg-muted/30 p-4">
                        <div className="mb-1.5 flex items-center gap-2">
                          <LightbulbIcon className="size-4 text-amber-500" />
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Problem Statement</h3>
                        </div>
                        <p className="text-sm leading-relaxed">{currentStartup.problem || "Not provided."}</p>
                      </div>
                      <div className="rounded-xl border bg-muted/30 p-4">
                        <div className="mb-1.5 flex items-center gap-2">
                          <TargetIcon className="size-4 text-blue-500" />
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proposed Solution</h3>
                        </div>
                        <p className="text-sm leading-relaxed">{currentStartup.solution || "Not provided."}</p>
                      </div>
                      <div className="rounded-xl border bg-muted/30 p-4">
                        <div className="mb-1.5 flex items-center gap-2">
                          <BanknoteIcon className="size-4 text-green-600" />
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Business Model</h3>
                        </div>
                        <p className="text-sm leading-relaxed">{currentStartup.businessModel || "Not provided."}</p>
                      </div>
                    </div>

                    <div className="rounded-xl border bg-card p-4 h-fit">
                      <div className="mb-3 flex items-center gap-2">
                        <LinkIcon className="size-4 text-primary" />
                        <h3 className="font-semibold text-sm">Quick Links</h3>
                      </div>
                      <div className="flex flex-col gap-2">
                        {currentStartup.attachments?.pitchDeck ? (
                          <a href={currentStartup.attachments.pitchDeck} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
                            <FileTextIcon className="size-4" /> View Pitch Deck
                          </a>
                        ) : (
                          <p className="flex items-center gap-2 text-xs text-muted-foreground"><FileTextIcon className="size-3.5" /> No pitch deck yet</p>
                        )}
                        {currentStartup.attachments?.website ? (
                          <a href={currentStartup.attachments.website} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
                            <GlobeIcon className="size-4" /> Visit Website
                          </a>
                        ) : (
                          <p className="flex items-center gap-2 text-xs text-muted-foreground"><GlobeIcon className="size-3.5" /> No website yet</p>
                        )}
                        {currentStartup.attachments?.demoVideo && (
                          <a href={currentStartup.attachments.demoVideo} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
                            <VideoIcon className="size-4" /> Watch Demo Video
                          </a>
                        )}
                      </div>
                      <Separator className="my-3" />
                      <Badge variant="secondary" className="capitalize w-full justify-center">{currentStartup.status || 'Pending Review'}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {isLeader && (
                <div className="flex flex-col justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center">
                  <div>
                    <h4 className="font-semibold text-destructive">Danger Zone</h4>
                    <p className="text-xs text-muted-foreground">Permanently delete your startup and disband this team.</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleDeleteStartup} disabled={isDeleting} className="shrink-0">
                    {isDeleting ? <Loader2Icon className="size-4 animate-spin mr-2" /> : <TrashIcon className="size-4 mr-2" />}
                    Delete Startup
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* JOURNEY TAB */}
        <TabsContent value="journey" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Incubation Lifecycle Status</CardTitle>
              <CardDescription>Follow the 11-step EDC venture progression roadmap.</CardDescription>
            </CardHeader>
            <CardContent>
              <JourneyTimeline
                currentStage={String(journeyStages.filter((s: any) =>
                  ['completed', 'approved'].includes((s.status || '').toLowerCase())
                ).length)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TEAM TAB */}
        <TabsContent value="team" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Current roster for {currentStartup.name}</CardDescription>
                </div>
                {!isLeader && (
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30" onClick={handleLeaveTeam}>
                    Leave Team
                  </Button>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-2.5">
                {currentStartup.teamMembers.map((m: any) => (
                  <TeamMemberCard
                    key={m.id}
                    id={m.id}
                    name={m.name}
                    role={m.role}
                    isLeaderViewing={isLeader}
                    removing={removing === m.id}
                    onRemove={handleRemoveMember}
                  />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recruit</CardTitle>
                <CardDescription>Let others scan this QR to request to join.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <QRCode value={status.team.code} size={150} />
                </div>
                <Button variant="outline" onClick={handleCopyCode} className="gap-2 font-mono tracking-[0.25em] font-bold text-primary">
                  {status.team.code}
                  <CopyIcon className="size-4 opacity-60" />
                </Button>
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
                  <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                    <div className="relative flex-1">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input placeholder="Name or NIAT ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                    <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
                      {isSearching ? <Loader2Icon className="size-4 animate-spin" /> : "Search"}
                    </Button>
                  </form>
                  {searchResults.length > 0 && (
                    <div className="mt-4 flex flex-col gap-2">
                      {searchResults.map((user: any) => (
                        <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{user.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">{user.niatId}</span>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleInvite(user.userId, user.niatId)} disabled={inviting === user.userId}>
                            {inviting === user.userId ? <Loader2Icon className="size-4 animate-spin" /> : <SendIcon className="size-4 mr-2" />}
                            Invite
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Pending Join Requests</CardTitle>
                    <CardDescription>Students who want to join your team.</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={async () => {
                    const res = await getTeamRequests()
                    if (res.requests) setRequests(res.requests)
                    toast.info("Refreshed")
                  }}>
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  {requests.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No pending requests.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {requests.map(req => (
                        <div key={req.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {req.studentName?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-sm">{req.studentName}</p>
                              <p className="text-xs text-muted-foreground">
                                {req.status === 'invited' ? 'Invite sent · awaiting response' : 'Wants to join your team'} · {new Date(req.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={removing === req.id} onClick={() => handleRequestAction(req.id, 'rejected')}>
                              <XIcon className="size-4" />
                            </Button>
                            <Button size="icon" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleRequestAction(req.id, 'approved')}>
                              <CheckIcon className="size-4" />
                            </Button>
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
        <TabsContent value="tasks" className="space-y-6">
          {isLeader && (
            <Card>
              <CardHeader>
                <CardTitle>Assign New Task</CardTitle>
                <CardDescription>Create and delegate work to your team members.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTask} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] items-end">
                  <div className="grid gap-2">
                    <Label>Task Title</Label>
                    <Input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required placeholder="E.g., Complete Pitch Deck" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Input value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} placeholder="Optional details..." />
                  </div>
                  <div className="grid gap-2">
                    <Label>Assignee</Label>
                    <Select value={newTaskAssignee} onValueChange={(v) => setNewTaskAssignee(v ?? '')} required>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select member" /></SelectTrigger>
                      <SelectContent>
                        {currentStartup.teamMembers.map((m: any) => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={isCreatingTask} className="gap-2">
                    {isCreatingTask ? <Loader2Icon className="size-4 animate-spin" /> : <SendIcon className="size-4" />}
                    Assign
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {tasks.length === 0 ? (
            <div className="rounded-xl border border-dashed py-12 text-center">
              <ListTodoIcon className="mx-auto mb-3 size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No tasks assigned yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {TASK_GROUPS.map(group => {
                const groupTasks = tasks.filter(t => t.status === group.status)
                return (
                  <div key={group.status} className="rounded-xl border bg-muted/20 p-3">
                    <div className="mb-3 flex items-center gap-2 px-1">
                      <span className={`size-2 rounded-full ${group.icon}`} />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</h3>
                      <span className="ml-auto text-xs font-medium text-muted-foreground">{groupTasks.length}</span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {groupTasks.length === 0 ? (
                        <p className="py-6 text-center text-xs text-muted-foreground/70">Nothing here</p>
                      ) : (
                        groupTasks.map(task => (
                          <TaskItem
                            key={task.id}
                            task={{ id: task.id, title: task.title, description: task.description, status: task.status, assigned_to: task.assigned_to }}
                            assigneeName={assigneeName(task.assigned_to)}
                            onStatusChange={handleStatusChange}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* MENTORS TAB */}
        <TabsContent value="mentors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Mentors</CardTitle>
              <CardDescription>Mentors you have requested to connect with.</CardDescription>
            </CardHeader>
            <CardContent>
              {mentorRequests.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <GraduationCapIcon className="size-10 mx-auto mb-3 opacity-20" />
                  <p>No mentors requested yet.</p>
                  <Button variant="link" onClick={() => window.location.href = '/mentors'}>Browse Mentors</Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {mentorRequests.map(req => (
                    <div key={req.id} className="overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
                      <div className="flex items-start justify-between gap-3 border-b bg-muted/30 p-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {req.mentorImage ? (
                            <img src={req.mentorImage} alt={req.mentorName} className="size-11 rounded-full object-cover border" />
                          ) : (
                            <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                              {req.mentorName.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-sm">{req.mentorName}</p>
                            <p className="truncate text-xs text-muted-foreground">{req.mentorRole} @ {req.mentorCompany}</p>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          req.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                          req.status === 'declined' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                        }`}>
                          {{ accepted: 'Connected', declined: 'Declined', pending: 'Pending' }[req.status as string] || req.status}
                        </span>
                      </div>
                      <div className="space-y-3 p-4">
                        <div>
                          <p className="font-medium text-sm">{req.topic}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{req.description}</p>
                        </div>
                        {req.status === 'accepted' ? (
                          <Button size="sm" className="w-full" onClick={() => window.location.href = `/startup/messages/${req.mentor_id}`}>
                            Message Mentor
                          </Button>
                        ) : (
                          <Button size="sm" className="w-full" variant="outline" disabled>
                            {req.status === 'pending' ? 'Awaiting Response...' : 'Declined'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* JOBS TAB (leader only) */}
        {isLeader && (
          <TabsContent value="recruitment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Applications</CardTitle>
                <CardDescription>Review students who applied for your roles.</CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="rounded-xl border border-dashed py-12 text-center">
                    <QrCodeIcon className="mx-auto mb-3 size-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No applications received yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="flex flex-col gap-4 rounded-xl border bg-card p-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1 min-w-0">
                          <div className="font-semibold">{app.students?.name}</div>
                          <div className="text-sm text-muted-foreground">Applied for: <span className="font-medium text-foreground">{app.job_postings?.title}</span></div>
                          <div className="text-sm text-muted-foreground">Dept: {app.students?.department} • Year: {app.students?.academic_year}</div>
                          <div className="mt-2 rounded-lg bg-muted/50 p-2.5 text-sm italic">"{app.cover_letter}"</div>
                          {app.resume_url && (
                            <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 pt-1 text-sm text-primary hover:underline">
                              <FileTextIcon className="size-3.5" /> View Resume
                            </a>
                          )}
                        </div>
                        <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0">
                          <Badge variant="secondary" className="capitalize">{app.status}</Badge>
                          {app.status === 'pending' || app.status === 'reviewed' ? (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200 dark:bg-green-950 dark:text-green-400" onClick={() => handleApplicationStatus(app.id, 'accepted')} disabled={updatingApp === app.id}>Accept</Button>
                              <Button size="sm" variant="outline" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200 dark:bg-red-950 dark:text-red-400" onClick={() => handleApplicationStatus(app.id, 'rejected')} disabled={updatingApp === app.id}>Reject</Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => handleApplicationStatus(app.id, 'reviewed')} disabled={updatingApp === app.id}>Reset to Reviewed</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
