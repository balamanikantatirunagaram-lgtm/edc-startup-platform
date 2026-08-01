"use client"

import * as React from "react"
import { Trash2Icon, PlusIcon, Loader2 } from "lucide-react"
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
import { getResources, createResource, deleteResource } from "@/services/content.service"

export default function AdminResourcesPage() {
  const [resources, setResources] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Form State
  const [title, setTitle] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [link, setLink] = React.useState("")
  const [icon, setIcon] = React.useState("FileText")

  const load = React.useCallback(async () => {
    setLoading(true)
    const data = await getResources()
    setResources(data)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const res = await createResource({
      title, category, description, link, icon
    })
    setIsSubmitting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Resource created successfully")
      setIsDialogOpen(false)
      load()
      // reset form
      setTitle(""); setCategory(""); setDescription(""); setLink(""); setIcon("FileText")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return
    const res = await deleteResource(id)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Resource deleted")
      load()
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manage Resources</h1>
          <p className="text-sm text-muted-foreground">Add and remove learning resources for students.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusIcon className="size-4" /> Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
                <DialogDescription>
                  Enter details for the new resource material.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input placeholder="Title (e.g. Y Combinator Startup Library)" value={title} onChange={e => setTitle(e.target.value)} required />
                <Input placeholder="Category (e.g. Guides)" value={category} onChange={e => setCategory(e.target.value)} required />
                <Input placeholder="Link URL" value={link} onChange={e => setLink(e.target.value)} required />
                <Input placeholder="Icon Name (e.g. FileText, Video, Link)" value={icon} onChange={e => setIcon(e.target.value)} required />
                <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Resource
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Resources ({resources.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex justify-center items-center">
               <Loader2 className="animate-spin text-muted-foreground size-6" />
            </div>
          ) : resources.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic text-sm">
              No resources found. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                    <th className="p-4">Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Link</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {resources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-medium">{resource.title}</td>
                      <td className="p-4 text-muted-foreground">{resource.category}</td>
                      <td className="p-4">
                        <a href={resource.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline line-clamp-1 max-w-[200px]">
                          {resource.link}
                        </a>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(resource.id)}>
                          <Trash2Icon className="size-4" />
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
