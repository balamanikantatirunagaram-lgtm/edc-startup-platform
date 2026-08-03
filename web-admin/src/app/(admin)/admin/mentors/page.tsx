"use client"

import * as React from "react"
import { Trash2Icon, PlusIcon, Loader2, PencilIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getMentors, createMentor, deleteMentor, updateMentor } from "@/services/content.service"

export default function AdminMentorsPage() {
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
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manage Mentors</h1>
          <p className="text-sm text-muted-foreground">Add and remove mentors available for students.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger render={
            <Button className="gap-2">
              <PlusIcon className="size-4" /> Add Mentor
            </Button>
          } />
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
                    <th className="p-4">Role & Company</th>
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
