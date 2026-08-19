"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, MapPin, DollarSign, Plus, CheckCircle2, Loader2, Search, ArrowRight, FileText, Send, Calendar, Clock, XCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getJobPostings, postJob, applyForJob, getMyApplications } from "@/services/jobs.service"
import { toast } from "sonner"
import { getMyStartup } from "@/services/startup.service"

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [canPostJob, setCanPostJob] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Post Job State
  const [postOpen, setPostOpen] = useState(false)
  const [posting, setPosting] = useState(false)
  const [jobForm, setJobForm] = useState({
    title: "", description: "", role_type: "Internship", location: "", stipend_salary: "", skills_required: ""
  })

  // Apply Job State
  const [applyOpen, setApplyOpen] = useState(false)
  const [applying, setApplying] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [applyForm, setApplyForm] = useState({ coverLetter: "", resume: null as File | null })
  
  const [myApplications, setMyApplications] = useState<any[]>([])
  const [myStartupId, setMyStartupId] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const [res, appsRes, startupRes] = await Promise.all([
      getJobPostings(),
      getMyApplications(),
      getMyStartup()
    ])
    
    if (res.jobs) setJobs(res.jobs)
    if (appsRes.applications) setMyApplications(appsRes.applications)
    
    // Check user's startup membership
    if (startupRes.startup) {
      setMyStartupId(startupRes.startup.id)
      if (startupRes.isLeader) {
        setCanPostJob(true)
      }
    }
      
    setLoading(false)
  }

  async function handlePostJob(e: React.FormEvent) {
    e.preventDefault()
    setPosting(true)
    
    const skillsArray = jobForm.skills_required.split(',').map(s => s.trim()).filter(s => s)
    const res = await postJob({ ...jobForm, skills_required: skillsArray })
    
    setPosting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Job posted successfully!")
      setPostOpen(false)
      setJobForm({title: "", description: "", role_type: "Internship", location: "", stipend_salary: "", skills_required: ""})
      load()
    }
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedJob) return
    setApplying(true)
    
    const res = await applyForJob(selectedJob.id, applyForm.coverLetter, applyForm.resume || undefined)
    
    setApplying(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Application submitted successfully!")
      setApplyOpen(false)
      setApplyForm({ coverLetter: "", resume: null })
      load()
    }
  }

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    j.role_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.startups?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (j.skills_required && j.skills_required.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())))
  )

  const getStatusConfig = (status: string) => {
    switch(status.toLowerCase()) {
      case 'accepted':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 }
      case 'rejected':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle }
      case 'reviewed':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock }
      default:
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Clock }
    }
  }

  return (
    <div className="container max-w-6xl py-10 mx-auto px-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex flex-col">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Internships & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Jobs</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover opportunities at top student startups or post openings for your own team.
          </p>
        </div>
        
        {canPostJob && (
          <Dialog open={postOpen} onOpenChange={setPostOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 rounded-full font-semibold px-6">
                <Plus className="mr-2 h-5 w-5" /> Post an Opening
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Post a Job Opening</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePostJob} className="space-y-5 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Job Title</Label>
                    <Input value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} placeholder="e.g. Frontend Developer" required className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role Type</Label>
                    <Select value={jobForm.role_type} onValueChange={v => setJobForm({...jobForm, role_type: v})}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Internship">Internship</SelectItem>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</Label>
                    <Input value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} placeholder="e.g. Remote, Campus" required className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stipend / Salary</Label>
                    <Input value={jobForm.stipend_salary} onChange={e => setJobForm({...jobForm, stipend_salary: e.target.value})} placeholder="e.g. Unpaid, $500/mo" required className="h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skills Required (comma separated)</Label>
                  <Input value={jobForm.skills_required} onChange={e => setJobForm({...jobForm, skills_required: e.target.value})} placeholder="React, Node.js, Design" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Job Description</Label>
                  <Textarea value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} placeholder="Describe the role and responsibilities..." rows={4} required className="resize-none" />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={posting} className="w-full h-11 text-base font-semibold">
                    {posting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null} Post Job
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="mb-8 p-1 h-auto bg-muted/50 rounded-xl">
          <TabsTrigger value="jobs" className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Briefcase className="w-4 h-4 mr-2" /> All Opportunities
          </TabsTrigger>
          <TabsTrigger value="applications" className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <CheckCircle2 className="w-4 h-4 mr-2" /> My Applications
            {myApplications.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                {myApplications.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="mb-8 relative max-w-xl group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input 
              placeholder="Search by role, startup, or skills..." 
              className="pl-12 h-14 text-base rounded-2xl bg-card border-border/50 shadow-sm focus-visible:ring-primary/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1,2,3,4,5,6].map(i => (
                <Card key={i} className="animate-pulse border-none bg-muted/30 h-[380px] rounded-2xl"></Card>
              ))
            ) : filteredJobs.length === 0 ? (
              <div className="col-span-full py-24 text-center bg-card rounded-3xl border border-dashed border-border/60 shadow-sm">
                <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">No opportunities found</h3>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  {searchQuery ? "We couldn't find any roles matching your search criteria." : "There are currently no open roles. Check back later!"}
                </p>
              </div>
            ) : (
              filteredJobs.map(job => (
                <Card key={job.id} className="border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group rounded-2xl overflow-hidden hover:-translate-y-1">
                  <CardHeader className="pb-4 bg-muted/20 border-b border-border/50 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="secondary" className="bg-background border-border text-foreground px-3 py-1 text-xs font-semibold shadow-sm">
                        {job.role_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-md">
                        {new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <CardTitle className="text-xl md:text-2xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {job.title}
                    </CardTitle>
                    <div className="text-sm font-semibold text-muted-foreground mt-3 flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <Briefcase className="h-3 w-3 text-primary" />
                      </div>
                      {job.startups?.name || "Unknown Startup"}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-6 pt-5">
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-5">
                      <div className="flex items-center gap-1.5 font-medium bg-muted/40 px-2.5 py-1.5 rounded-lg border border-border/50">
                        <MapPin className="h-3.5 w-3.5" /> {job.location || 'Remote'}
                      </div>
                      <div className="flex items-center gap-1.5 font-medium bg-muted/40 px-2.5 py-1.5 rounded-lg border border-border/50">
                        <DollarSign className="h-3.5 w-3.5" /> {job.stipend_salary || 'Unpaid'}
                      </div>
                    </div>
                    
                    <p className="text-sm line-clamp-3 mb-6 flex-1 text-muted-foreground leading-relaxed">
                      {job.description}
                    </p>
                    
                    {job.skills_required && job.skills_required.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {job.skills_required.slice(0, 4).map((skill: string) => (
                          <span key={skill} className="px-3 py-1.5 bg-secondary/50 border border-border text-xs rounded-lg font-medium text-secondary-foreground">{skill}</span>
                        ))}
                        {job.skills_required.length > 4 && (
                          <span className="px-3 py-1.5 bg-secondary/50 border border-border text-xs rounded-lg font-medium text-secondary-foreground">+{job.skills_required.length - 4}</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-6 pt-0 mt-auto">
                    {(() => {
                      if (job.startup_id === myStartupId) {
                        return (
                          <Button className="w-full h-12 rounded-xl" variant="outline" disabled>
                            Your Startup's Job
                          </Button>
                        );
                      }
                      
                      const existingApp = myApplications.find(app => app.job_id === job.id);
                      if (existingApp) {
                        return (
                          <Button className="w-full h-12 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200" variant="outline" disabled>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Applied ({existingApp.status})
                          </Button>
                        );
                      }

                      return (
                        <Button 
                          className="w-full transition-all bg-muted text-foreground hover:bg-primary hover:text-primary-foreground font-semibold h-12 rounded-xl group/btn"
                          variant="secondary"
                          onClick={() => { setSelectedJob(job); setApplyOpen(true) }}
                        >
                          View Details & Apply 
                          <ArrowRight className="ml-2 h-4 w-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                        </Button>
                      );
                    })()}
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : myApplications.length === 0 ? (
            <div className="text-center py-24 bg-card rounded-2xl border border-dashed flex flex-col items-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">No applications yet</h3>
              <p className="text-muted-foreground mb-6">Explore the jobs board to find your next opportunity.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myApplications.map(app => {
                const StatusIcon = getStatusConfig(app.status).icon
                const job = app.job_postings
                return (
                  <Card key={app.id} className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="bg-muted/30 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{job?.title}</CardTitle>
                          <p className="text-muted-foreground mt-1 font-medium">{job?.startups?.name}</p>
                        </div>
                        <Badge variant="outline" className={`px-3 py-1 flex items-center gap-1.5 ${getStatusConfig(app.status).color}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          <span className="capitalize">{app.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" /> Applied on {new Date(app.applied_at).toLocaleDateString()}
                        </div>
                        {app.resume_url && (
                          <div className="flex items-center gap-2 text-primary">
                            <FileText className="h-4 w-4" /> 
                            <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="hover:underline">View Attached Resume</a>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Your Cover Letter:</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg italic whitespace-pre-wrap">
                          "{app.cover_letter}"
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold">Apply for Role</DialogTitle>
            {selectedJob && (
              <div className="mt-2 text-muted-foreground text-sm">
                Applying for <span className="font-semibold text-foreground">{selectedJob.title}</span> at <span className="font-semibold text-foreground">{selectedJob.startups?.name}</span>
              </div>
            )}
          </DialogHeader>
          <form onSubmit={handleApply} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Cover Letter</Label>
              <Textarea 
                value={applyForm.coverLetter} 
                onChange={e => setApplyForm({...applyForm, coverLetter: e.target.value})} 
                placeholder="Explain your relevant experience and why you're a perfect fit for this startup..." 
                rows={6} 
                required 
                className="resize-none text-base"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Resume / CV (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-muted/30 transition-colors cursor-pointer relative group">
                <Input 
                  type="file" 
                  accept=".pdf" 
                  onChange={e => setApplyForm({...applyForm, resume: e.target.files ? e.target.files[0] : null})} 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-3 pointer-events-none">
                  <div className="p-4 bg-muted rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <FileText className="h-8 w-8" />
                  </div>
                  {applyForm.resume ? (
                    <p className="font-semibold text-primary">{applyForm.resume.name}</p>
                  ) : (
                    <>
                      <p className="font-medium text-foreground">Click to upload your resume (PDF)</p>
                      <p className="text-sm text-muted-foreground px-4">If you skip this, the startup will review your EDC profile.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-8 gap-3 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setApplyOpen(false)} className="h-11">Cancel</Button>
              <Button type="submit" disabled={applying} className="h-11 px-6 shadow-md">
                {applying ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />} 
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
