"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeftIcon, PlusIcon, Trash2Icon, Loader2, GripVerticalIcon, VideoIcon, EditIcon } from "lucide-react"
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
} from "@/components/ui/dialog"
import { getCourse, addCourseModule, deleteCourseModule, uploadCourseFile } from "@/services/learning.service"

export default function AdminCourseModulesPage({ params }: { params: { id: string } }) {
  const [course, setCourse] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  
  // Dialogs
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  // Module Form
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [videoUrl, setVideoUrl] = React.useState("")
  const [orderIndex, setOrderIndex] = React.useState(0)

  const load = React.useCallback(async () => {
    setLoading(true)
    const data = await getCourse(params.id)
    setCourse(data)
    setLoading(false)
  }, [params.id])

  React.useEffect(() => {
    load()
  }, [load])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setVideoUrl("")
    setOrderIndex(course?.course_modules?.length || 0)
    setEditingId(null)
  }

  const openCreate = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEdit = (mod: any) => {
    setEditingId(mod.id)
    setTitle(mod.title || "")
    setDescription(mod.description || "")
    setVideoUrl(mod.video_url || "")
    setOrderIndex(mod.order_index || 0)
    setIsDialogOpen(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    
    // Uploading to course-videos bucket
    const res = await uploadCourseFile(formData, 'course-videos')
    setIsUploading(false)
    if (res.error) {
      toast.error(res.error)
    } else if (res.url) {
      setVideoUrl(res.url)
      toast.success("Video uploaded successfully!")
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const res = await addCourseModule(editingId, params.id, {
      title, description, video_url: videoUrl, order_index: orderIndex
    })
    setIsSubmitting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(editingId ? "Module updated!" : "Module added!")
      setIsDialogOpen(false)
      resetForm()
      load()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete module "${name}"?`)) return
    const res = await deleteCourseModule(id)
    if (res.error) toast.error(res.error)
    else {
      toast.success("Module deleted.")
      load()
    }
  }

  if (loading) {
    return <div className="flex p-12 justify-center"><Loader2 className="animate-spin size-6 text-muted-foreground" /></div>
  }

  if (!course) {
    return <div className="p-12 text-center text-muted-foreground">Course not found.</div>
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="size-8">
            <Link href="/admin/learning-hub">
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-semibold tracking-tight">{course.title}</h1>
            <p className="text-xs text-muted-foreground">Manage modules and video lessons for this course.</p>
          </div>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="mr-2 size-4" />
          Add Module
        </Button>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Curriculum Modules</CardTitle>
          <CardDescription>Drag and drop reordering coming soon. Currently sorted by Order Index.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!course.course_modules || course.course_modules.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center border-t">
              <div className="size-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <VideoIcon className="size-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No modules yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Add your first video lesson to start building this course.
              </p>
              <Button variant="outline" className="mt-4" onClick={openCreate}>
                <PlusIcon className="mr-2 size-4" /> Add Module
              </Button>
            </div>
          ) : (
            <div className="divide-y border-t">
              {course.course_modules.map((mod: any, idx: number) => (
                <div key={mod.id} className="flex items-center gap-4 p-4 bg-card hover:bg-muted/30 transition-colors group">
                  <div className="text-muted-foreground cursor-grab">
                    <GripVerticalIcon className="size-5 opacity-30 group-hover:opacity-100" />
                  </div>
                  <div className="size-10 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{mod.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{mod.description}</p>
                    {mod.video_url && (
                      <a href={mod.video_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline inline-flex items-center gap-1 mt-1">
                        <VideoIcon className="size-3" /> View attached video
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(mod)}>
                      <EditIcon className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(mod.id, mod.title)}>
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Module" : "Add Module"}</DialogTitle>
              <DialogDescription>
                Add a video lesson to your course. You can upload an MP4 or paste a YouTube link.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Module Title</label>
                <Input placeholder="e.g. Introduction to Startups" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Description / Instructor Notes</label>
                <Textarea 
                  placeholder="What is covered in this lesson?" 
                  className="min-h-[80px]"
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                />
              </div>

              <div className="space-y-1 p-3 bg-muted/40 rounded-lg border">
                <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <VideoIcon className="size-3.5 text-primary" /> Video File
                </label>
                
                <div className="mt-2 space-y-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Option 1: Upload MP4</label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="file" 
                        accept="video/*" 
                        className="file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                      {isUploading && <Loader2 className="animate-spin size-4 text-muted-foreground shrink-0" />}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-muted px-2 text-muted-foreground">OR</span></div>
                  </div>

                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Option 2: Paste Link</label>
                    <Input 
                      placeholder="e.g. https://youtube.com/watch?v=..." 
                      value={videoUrl} 
                      onChange={e => setVideoUrl(e.target.value)} 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Order Index</label>
                <Input type="number" placeholder="0" value={orderIndex} onChange={e => setOrderIndex(parseInt(e.target.value) || 0)} required />
                <p className="text-[10px] text-muted-foreground">Lower numbers appear first.</p>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Update Module" : "Save Module"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
