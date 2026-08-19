"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Briefcase, MapPin, DollarSign, ExternalLink, Loader2, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getAllJobPostings, deleteJobPosting, postJobAdmin, getJobApplications } from "@/services/jobs.service"
import { getAllStartups } from "@/services/admin.service"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [startups, setStartups] = useState<any[]>([])
  
  const [postOpen, setPostOpen] = useState(false)
  const [appsOpen, setAppsOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loadingApps, setLoadingApps] = useState(false)

  async function handleViewApps(job: any) {
    setSelectedJob(job)
    setAppsOpen(true)
    setLoadingApps(true)
    const res = await getJobApplications(job.id)
    if (res.applications) setApplications(res.applications)
    setLoadingApps(false)
  }
  const [posting, setPosting] = useState(false)
  const [jobForm, setJobForm] = useState({
    startup_id: "",
    title: "",
    description: "",
    role_type: "",
    location: "",
    stipend_salary: "",
    skills_required: ""
  })

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const [res, startupsData] = await Promise.all([
      getAllJobPostings(),
      getAllStartups()
    ])
    if (res.jobs) setJobs(res.jobs)
    if (startupsData && !('error' in startupsData)) setStartups(startupsData as any[])
    setLoading(false)
  }

  async function handlePostJob(e: React.FormEvent) {
    e.preventDefault()
    if (!jobForm.startup_id) {
      toast.error("Please select a startup")
      return
    }
    setPosting(true)
    
    const skillsArray = jobForm.skills_required.split(',').map(s => s.trim()).filter(s => s)
    const res = await postJobAdmin({ ...jobForm, skills_required: skillsArray })
    
    setPosting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Job posted successfully!")
      setPostOpen(false)
      setJobForm({ startup_id: "", title: "", description: "", role_type: "", location: "", stipend_salary: "", skills_required: "" })
      load()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to permanently delete this job posting? This action cannot be undone.")) return
    
    const res = await deleteJobPosting(id)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Job posting removed")
      load()
    }
  }

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (job.startups?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job & Internship Moderation</h1>
          <p className="text-muted-foreground mt-1">Review, monitor, and remove inappropriate job postings by startups.</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search roles or startups..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
          <Dialog open={postOpen} onOpenChange={setPostOpen}>
            <DialogTrigger render={<Button size="lg" className="h-11 px-4 shrink-0" />}>
                <Plus className="h-4 w-4 mr-2" /> Post Role
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Post a New Role</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePostJob} className="space-y-6 py-4">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Select Startup</Label>
                  <Select value={jobForm.startup_id} onValueChange={(v) => setJobForm({...jobForm, startup_id: v ?? ""})}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select the startup..." />
                    </SelectTrigger>
                    <SelectContent>
                      {startups.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Job Title</Label>
                  <Input value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} placeholder="e.g. Frontend Developer Intern" required className="h-11" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Role Type</Label>
                    <Select value={jobForm.role_type} onValueChange={v => setJobForm({...jobForm, role_type: v ?? ""})}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Internship">Internship</SelectItem>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Cofounder">Cofounder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Location</Label>
                    <Input value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} placeholder="Remote / Campus" className="h-11" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Compensation</Label>
                  <Input value={jobForm.stipend_salary} onChange={e => setJobForm({...jobForm, stipend_salary: e.target.value})} placeholder="e.g. ₹5,000/month or Unpaid" className="h-11" />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Required Skills (comma separated)</Label>
                  <Input value={jobForm.skills_required} onChange={e => setJobForm({...jobForm, skills_required: e.target.value})} placeholder="React, Node.js" className="h-11" />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Description</Label>
                  <Textarea value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} placeholder="Describe the responsibilities..." rows={4} required className="resize-none" />
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
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center flex-col text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading campus opportunities...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="py-20 text-center bg-muted/20 border border-dashed rounded-xl">
          <Briefcase className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
          <p className="text-lg font-medium">No job postings found</p>
          <p className="text-sm text-muted-foreground">Startups haven't posted any roles yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map(job => (
            <Card key={job.id} className="flex flex-col group border-border shadow-sm">
              <CardHeader className="pb-3 border-b bg-muted/10">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-background">
                    {job.role_type}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 -mr-2 -mt-2" onClick={() => handleDelete(job.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg line-clamp-1">{job.title}</CardTitle>
                <div className="text-sm font-medium text-primary mt-1">
                  {job.startups?.name || "Unknown Startup"}
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location || 'Remote'}</div>
                  <div className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {job.stipend_salary || 'Unpaid'}</div>
                </div>
                <p className="text-sm line-clamp-4 flex-1 text-muted-foreground mb-4">
                  {job.description}
                </p>
                <div className="flex justify-between items-center border-t pt-3 mt-auto">
                  <div className="text-xs text-muted-foreground">
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleViewApps(job)}>
                    View Applicants
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    
      <Dialog open={appsOpen} onOpenChange={setAppsOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Applicants: {selectedJob?.title}</DialogTitle>
          </DialogHeader>
          {loadingApps ? (
            <div className="py-10 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
          ) : applications.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">No one has applied to this job yet.</div>
          ) : (
            <div className="space-y-4 py-4">
              {applications.map(app => (
                <div key={app.id} className="border rounded-xl p-4 bg-muted/20">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-lg">{app.students?.name}</div>
                      <div className="text-sm text-muted-foreground">{app.students?.department} • Year {app.students?.academic_year}</div>
                      <div className="text-sm text-muted-foreground">{app.students?.email}</div>
                    </div>
                    <Badge variant="outline" className="uppercase bg-background">{app.status}</Badge>
                  </div>
                  <div className="text-sm italic bg-card p-3 rounded border mb-2">"{app.cover_letter}"</div>
                  {app.resume_url && (
                    <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> View Resume
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
