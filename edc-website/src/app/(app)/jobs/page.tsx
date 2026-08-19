"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, MapPin, DollarSign, Plus, CheckCircle2, Loader2, Search, ArrowRight, FileText, Send } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    job.role_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (job.startups?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container max-w-7xl py-10 mx-auto px-4 md:px-6">
      {/* Header Section */}
      <div className="flex flex-col mb-10">
        <Badge variant="outline" className="mb-4 bg-primary/5 text-primary border-primary/20 px-3 py-1 w-fit">
          <Briefcase className="h-3 w-3 mr-2 inline" /> Campus Opportunities
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
          Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Big Role</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
          Join a campus startup, land an internship, or recruit talented co-founders to build the next unicorn.
        </p>
      </div>
      
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10 items-center justify-between bg-card p-2 rounded-full border border-border shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by role, startup, or keywords..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-transparent border-none shadow-none text-base focus-visible:ring-0 focus-visible:ring-offset-0" 
          />
        </div>
        
        {canPostJob && (
          <Dialog open={postOpen} onOpenChange={setPostOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-12 px-6 rounded-full shrink-0 w-full sm:w-auto">
                <Plus className="h-5 w-5 mr-2" /> Post a Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Post a New Role</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePostJob} className="space-y-6 py-4">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Job Title</Label>
                  <Input value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} placeholder="e.g. Frontend Developer Intern" required className="h-11" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Role Type</Label>
                    <Select value={jobForm.role_type} onValueChange={v => setJobForm({...jobForm, role_type: v})}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Internship">Internship</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Cofounder">Co-founder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Location</Label>
                    <Input value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} placeholder="Remote / Campus" className="h-11" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Compensation (Stipend/Equity/Unpaid)</Label>
                  <Input value={jobForm.stipend_salary} onChange={e => setJobForm({...jobForm, stipend_salary: e.target.value})} placeholder="e.g. ₹5,000/month or Unpaid" className="h-11" />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Required Skills (comma separated)</Label>
                  <Input value={jobForm.skills_required} onChange={e => setJobForm({...jobForm, skills_required: e.target.value})} placeholder="React, Node.js, UI/UX" className="h-11" />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Description</Label>
                  <Textarea value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} placeholder="Describe the responsibilities and what you are looking for..." rows={5} required className="resize-none" />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setPostOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={posting} className="h-11 px-8">
                    {posting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null} Publish Role
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-lg">Loading opportunities...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-card rounded-3xl border border-dashed border-border flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Briefcase className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">No roles found</h3>
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
