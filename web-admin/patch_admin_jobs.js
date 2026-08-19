const fs = require('fs');
const file = 'src/app/(admin)/admin/jobs/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add import
content = content.replace(
  'import { getJobPostings, deleteJobPosting, postJobAdmin } from "@/services/jobs.service"',
  'import { getJobPostings, deleteJobPosting, postJobAdmin, getJobApplications } from "@/services/jobs.service"'
);

// Add icons
content = content.replace(
  'import { Briefcase, MapPin, DollarSign, Loader2, Search, Trash2, Plus, Building2 } from "lucide-react"',
  'import { Briefcase, MapPin, DollarSign, Loader2, Search, Trash2, Plus, Building2, Users } from "lucide-react"'
);

// Add state
content = content.replace(
  'const [postOpen, setPostOpen] = useState(false)',
  `const [postOpen, setPostOpen] = useState(false)
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
  }`
);

// Add view apps button
content = content.replace(
  '<Button variant="destructive" size="sm" onClick={() => handleDelete(job.id)} disabled={deleting === job.id} className="w-full">',
  `<Button variant="secondary" size="sm" onClick={() => handleViewApps(job)} className="w-full mb-2">
                    <Users className="h-4 w-4 mr-2" /> View Applicants
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(job.id)} disabled={deleting === job.id} className="w-full">`
);

// Add dialog
content = content.replace(
  '</div>\n  )\n}\n',
  `
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
                      <div className="text-sm text-muted-foreground">{app.students?.department} • Year {app.students?.academicYear}</div>
                      <div className="text-sm text-muted-foreground">{app.students?.email} • {app.students?.phone}</div>
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
`
);

fs.writeFileSync(file, content);
