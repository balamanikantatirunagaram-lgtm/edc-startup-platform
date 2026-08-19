"use client"

import * as React from "react"
import Link from "next/link"
import { Trash2Icon, PlusIcon, Loader2, EditIcon, ImagePlusIcon, BookOpenIcon, PlayCircleIcon } from "lucide-react"
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
import { getCourses, createCourse, deleteCourse, updateCourse, uploadCourseFile } from "@/services/learning.service"

export default function AdminLearningHubPage() {
  const [courses, setCourses] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  
  // Dialogs
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  // Form
  const [title, setTitle] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [duration, setDuration] = React.useState("")
  const [instructor, setInstructor] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [thumbnailUrl, setThumbnailUrl] = React.useState("")

  const load = React.useCallback(async () => {
    setLoading(true)
    const data = await getCourses()
    setCourses(data)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const resetForm = () => {
    setTitle("")
    setCategory("")
    setDuration("")
    setInstructor("")
    setDescription("")
    setThumbnailUrl("")
    setEditingId(null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    
    const res = await uploadCourseFile(formData, 'course-thumbnails')
    setIsUploading(false)
    if (res.error) {
      toast.error(res.error)
    } else if (res.url) {
      setThumbnailUrl(res.url)
      toast.success("Thumbnail uploaded successfully!")
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const res = await createCourse({
      title, category, duration, instructor, description, thumbnail_url: thumbnailUrl
    })
    setIsSubmitting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Course created! Click on it to add video modules.")
      setIsDialogOpen(false)
      resetForm()
      load()
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    setIsSubmitting(true)
    const res = await updateCourse(editingId, {
      title, category, duration, instructor, description, thumbnail_url: thumbnailUrl
    })
    setIsSubmitting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Course updated successfully!")
      setIsEditDialogOpen(false)
      resetForm()
      load()
    }
  }

  const openEdit = (course: any) => {
    setEditingId(course.id)
    setTitle(course.title || "")
    setCategory(course.category || "")
    setDuration(course.duration || "")
    setInstructor(course.instructor || "")
    setDescription(course.description || "")
    setThumbnailUrl(course.thumbnail_url || "")
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all its modules.`)) return
    const res = await deleteCourse(id)
    if (res.error) toast.error(res.error)
    else {
      toast.success("Course deleted.")
      load()
    }
  }

  const formFieldsUI = (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Course Title</label>
          <Input placeholder="e.g. Startup Basics 101" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Category</label>
          <Input placeholder="e.g. Masterclass, Tech, Legal" value={category} onChange={e => setCategory(e.target.value)} required />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Instructor Name</label>
          <Input placeholder="e.g. John Doe" value={instructor} onChange={e => setInstructor(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Total Duration</label>
          <Input placeholder="e.g. 2h 15m" value={duration} onChange={e => setDuration(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">Thumbnail Image</label>
        <div className="flex gap-2">
          <Input 
            type="file" 
            accept="image/*" 
            className="file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          {isUploading && <Loader2 className="animate-spin size-4 mt-2.5 text-muted-foreground" />}
        </div>
        {thumbnailUrl && <p className="text-[10px] text-green-600 truncate mt-1">✓ Thumbnail uploaded</p>}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">Course Description</label>
        <Textarea 
          placeholder="What will students learn?" 
          className="min-h-[100px]"
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          required 
        />
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Learning Hub</h1>
          <p className="text-sm text-muted-foreground">Manage structured courses, masterclasses, and tutorial videos.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusIcon className="mr-2 size-4" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Setup the course container. You can add video modules to it in the next step.
                </DialogDescription>
              </DialogHeader>
              
              {formFieldsUI}

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Course
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit Course Details</DialogTitle>
            </DialogHeader>
            {formFieldsUI}
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Course
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>All Courses ({courses.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex justify-center items-center">
               <Loader2 className="animate-spin text-muted-foreground size-6" />
            </div>
          ) : courses.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center border-t">
              <div className="size-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <BookOpenIcon className="size-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No courses found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Create your first course. You can then click into it to add video lessons and modules.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/20">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-md transition-all group flex flex-col">
                  <div className="relative h-32 bg-muted border-b flex shrink-0">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <ImagePlusIcon className="size-8 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button asChild variant="secondary" size="sm">
                        <Link href={`/admin/learning-hub/${course.id}`}>
                          Manage Modules
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg line-clamp-1" title={course.title}>{course.title}</h3>
                      </div>
                      <p className="text-xs text-primary font-medium mt-1">{course.category}</p>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{course.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <PlayCircleIcon className="size-4" />
                        <span className="font-medium text-foreground">{course.course_modules?.[0]?.count || 0}</span> modules
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="size-7 hover:text-primary" onClick={() => openEdit(course)}>
                          <EditIcon className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-7 hover:text-destructive" onClick={() => handleDelete(course.id, course.title)}>
                          <Trash2Icon className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
