"use client"

import * as React from "react"
import { SearchIcon, CircleDotIcon, CircleXIcon, Loader2, PlusIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { getAllStudents, toggleStudentSuspension, resetStudentPassword, getStudentProfileAdmin } from "@/services/admin.service"
import { getMentors, createMentor, deleteMentor, updateMentor } from "@/services/content.service"
import { IAdminStudent } from "@/types"

function StudentsTab() {
  const [search, setSearch] = React.useState("")
  const [deptFilter, setDeptFilter] = React.useState("all")
  const [yearFilter, setYearFilter] = React.useState("all")
  const [students, setStudents] = React.useState<IAdminStudent[]>([])
  const [loading, setLoading] = React.useState(true)

  const [toggling, setToggling] = React.useState<string | null>(null)
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false)
  const [resettingUser, setResettingUser] = React.useState<{id: string, name: string} | null>(null)
  const [newPassword, setNewPassword] = React.useState("")
  const [resetting, setResetting] = React.useState(false)

  const [profileDialogOpen, setProfileDialogOpen] = React.useState(false)
  const [viewingStudent, setViewingStudent] = React.useState<any>(null)
  const [loadingProfile, setLoadingProfile] = React.useState(false)

  const handleViewProfile = async (student: IAdminStudent) => {
    setViewingStudent(student)
    setProfileDialogOpen(true)
    setLoadingProfile(true)
    const res = await getStudentProfileAdmin(student.id)
    if (res.error) {
      toast.error(res.error)
    } else {
      setViewingStudent({ ...student, ...res.data })
    }
    setLoadingProfile(false)
  }

  const fetchStudents = async () => {
    setLoading(true)
    const data = await getAllStudents()
    setStudents(data)
    setLoading(false)
  }

  React.useEffect(() => {
    fetchStudents()
  }, [])

  const handleToggleSuspension = async (id: string, isSuspended: boolean) => {
    setToggling(id)
    const res = await toggleStudentSuspension(id, !isSuspended)
    setToggling(null)
    
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(`User ${!isSuspended ? 'suspended' : 'activated'} successfully.`)
      fetchStudents()
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resettingUser || !newPassword) return

    setResetting(true)
    const res = await resetStudentPassword(resettingUser.id, newPassword)
    setResetting(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(`Password for ${resettingUser.name} has been reset.`)
      setResetDialogOpen(false)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(search.toLowerCase()) ||
      student.niatId?.toLowerCase().includes(search.toLowerCase()) ||
      student.email?.toLowerCase().includes(search.toLowerCase())

    const matchesDept = deptFilter === "all" || student.department === deptFilter
    const matchesYear = yearFilter === "all" || student.academicYear === yearFilter

    return matchesSearch && matchesDept && matchesYear
  })
  
  const departments = Array.from(new Set(students.map(s => s.department).filter(Boolean)))
  const years = Array.from(new Set(students.map(s => s.academicYear).filter(Boolean)))

  return (
    <div className="flex flex-col gap-6">
      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or NIAT ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Select value={deptFilter} onValueChange={(v) => setDeptFilter(v ?? '')}>
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d: any) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={yearFilter} onValueChange={(v) => setYearFilter(v ?? '')}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((y: any) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Founders Directory ({filteredStudents.length})</CardTitle>
          <CardDescription>Lists registered profiles under the incubation group.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex justify-center items-center">
               <Loader2 className="animate-spin text-muted-foreground size-6" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic text-sm">
              No students match the criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                    <th className="p-4">Student</th>
                    <th className="p-4">Department &amp; Year</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-foreground">{student.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {student.niatId} · {student.email}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          <span>{student.department || 'N/A'}</span>
                          <span>{student.academicYear || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {student.isSuspended ? (
                          <div className="flex items-center gap-1.5 text-xs">
                            <CircleXIcon className="size-3 text-red-500 fill-red-500" />
                            <span className="text-red-600 font-medium">Suspended</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs">
                            <CircleDotIcon className="size-3 text-green-500 fill-green-500" />
                            <span className="text-foreground">Active</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleViewProfile(student)}
                          >
                            View Profile
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setResettingUser({ id: student.id, name: student.name || 'Unknown' })
                              setNewPassword("")
                              setResetDialogOpen(true)
                            }}
                          >
                            Reset Password
                          </Button>
                          <Button
                            variant={student.isSuspended ? "default" : "destructive"}
                            size="sm"
                            disabled={toggling === student.id}
                            onClick={() => handleToggleSuspension(student.id, !!student.isSuspended)}
                          >
                            {toggling === student.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {student.isSuspended ? "Activate" : "Suspend"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleResetPassword}>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Set a new password for {resettingUser?.name}. They can use this immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input 
                type="text" 
                placeholder="New Password (min 6 chars)" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                required 
                minLength={6}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={resetting}>
                {resetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Founder Profile</DialogTitle>
            <DialogDescription>Full details registered by the student.</DialogDescription>
          </DialogHeader>
          
          {loadingProfile ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-muted-foreground size-8" />
            </div>
          ) : viewingStudent ? (
            <div className="flex flex-col gap-6 py-4">
              <div className="flex items-center gap-4">
                {viewingStudent.avatarUrl ? (
                  <img src={viewingStudent.avatarUrl} alt={viewingStudent.name} className="size-16 rounded-full object-cover border" />
                ) : (
                  <div className="size-16 rounded-full bg-muted flex items-center justify-center font-bold text-xl">
                    {viewingStudent.name?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold">{viewingStudent.name}</h3>
                  <p className="text-sm text-muted-foreground">{viewingStudent.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground font-medium">NIAT ID</span>
                  <span>{viewingStudent.niatId || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground font-medium">College ID</span>
                  <span>{viewingStudent.collegeId || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground font-medium">Department</span>
                  <span>{viewingStudent.department || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground font-medium">Academic Year</span>
                  <span>{viewingStudent.academicYear || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground font-medium">Phone</span>
                  <span>{viewingStudent.phone || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground font-medium">Joined</span>
                  <span>{viewingStudent.created_at ? new Date(viewingStudent.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="font-semibold border-b pb-1">Links & Socials</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground font-medium">Portfolio</span>
                    {viewingStudent.portfolio ? (
                      <a href={viewingStudent.portfolio.startsWith('http') ? viewingStudent.portfolio : `https://${viewingStudent.portfolio}`} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                        {viewingStudent.portfolio}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">Not provided</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground font-medium">GitHub</span>
                    {viewingStudent.github ? (
                      <a href={viewingStudent.github.startsWith('http') ? viewingStudent.github : `https://github.com/${viewingStudent.github}`} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                        {viewingStudent.github}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">Not provided</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground font-medium">LinkedIn</span>
                    {viewingStudent.linkedin ? (
                      <a href={viewingStudent.linkedin.startsWith('http') ? viewingStudent.linkedin : `https://linkedin.com/in/${viewingStudent.linkedin}`} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                        {viewingStudent.linkedin}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              {viewingStudent.skills && viewingStudent.skills.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="font-semibold border-b pb-1">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingStudent.skills.map((skill: string) => (
                      <span key={skill} className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MentorsTab() {
  const [mentors, setMentors] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Form State
  const [name, setName] = React.useState("")
  const [role, setRole] = React.useState("")
  const [company, setCompany] = React.useState("")
  const [expertise, setExpertise] = React.useState("")
  const [availability, setAvailability] = React.useState("")
  const [image, setImage] = React.useState("")
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    const data = await getMentors()
    setMentors(data)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const resetForm = () => {
    setName(""); setRole(""); setCompany(""); setExpertise(""); setAvailability(""); setImage("")
    setUsername(""); setPassword("")
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const expArray = expertise.split(",").map(s => s.trim()).filter(Boolean)
    const payload: any = { name, role, company, expertise: expArray, availability, image }

    let res;
    if (editingId) {
      res = await updateMentor(editingId, payload)
    } else {
      res = await createMentor({ ...payload, username, password })
    }

    setIsSubmitting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(editingId ? "Mentor updated successfully" : "Mentor created successfully")
      setIsDialogOpen(false)
      load()
      resetForm()
    }
  }

  const handleEdit = (item: any) => {
    setName(item.name)
    setRole(item.role)
    setCompany(item.company)
    setExpertise((item.expertise || []).join(", "))
    setAvailability(item.availability)
    setImage(item.image || "")
    setEditingId(item.id)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mentor?")) return
    const res = await deleteMentor(id)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Mentor deleted")
      load()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium tracking-tight">Manage Mentors</h2>
          <p className="text-sm text-muted-foreground">Add and remove mentors available for students.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger render={<Button className="gap-2" />}>
            <PlusIcon className="size-4" /> Add Mentor
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Mentor" : "Add New Mentor"}</DialogTitle>
                <DialogDescription>
                  {editingId ? "Update details for the mentor profile." : "Enter details for the new mentor profile."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                <Input placeholder="Role (e.g. CEO, Product Manager)" value={role} onChange={e => setRole(e.target.value)} required />
                <Input placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} required />
                <Input placeholder="Expertise (comma separated)" value={expertise} onChange={e => setExpertise(e.target.value)} required />
                <Input placeholder="Availability (e.g. 2 hrs/week)" value={availability} onChange={e => setAvailability(e.target.value)} required />
                <Input placeholder="Image URL (optional)" value={image} onChange={e => setImage(e.target.value)} />
                {!editingId && (
                  <>
                    <Input placeholder="Login Username" value={username} onChange={e => setUsername(e.target.value)} required />
                    <Input type="password" placeholder="Login Password" value={password} onChange={e => setPassword(e.target.value)} required />
                  </>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Update Mentor" : "Save Mentor"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Mentors ({mentors.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex justify-center items-center">
               <Loader2 className="animate-spin text-muted-foreground size-6" />
            </div>
          ) : mentors.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic text-sm">
              No mentors found. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                    <th className="p-4">Name</th>
                    <th className="p-4">Role &amp; Company</th>
                    <th className="p-4">Availability</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {mentors.map((mentor) => (
                    <tr key={mentor.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-medium">{mentor.name}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          <span>{mentor.role}</span>
                          <span>{mentor.company}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{mentor.availability}</td>
                      <td className="p-4 text-right space-x-2">
                        <Button variant="outline" size="sm" className="text-blue-500 hover:text-blue-600" onClick={() => handleEdit(mentor)}>
                          <PencilIcon className="size-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(mentor.id)}>
                          <Trash2Icon className="size-4 mr-2" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Users Management</h1>
        <p className="text-sm text-muted-foreground">Manage students, mentors, and platform users.</p>
      </section>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="mentors">Mentors</TabsTrigger>
        </TabsList>
        <TabsContent value="students" className="mt-0">
          <StudentsTab />
        </TabsContent>
        <TabsContent value="mentors" className="mt-0">
          <MentorsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
