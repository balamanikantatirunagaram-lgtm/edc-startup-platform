"use client"

import * as React from "react"
import { Trash2Icon, PlusIcon, Loader2, EditIcon, SparklesIcon, ImagePlusIcon, Wand2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getEventsAdmin, createEvent, deleteEvent, updateEvent, getEventRegistrations } from "@/services/events.service"
import { uploadEventBanner } from "@/services/content.service"
import { generateEventDescription, rewriteEventDescription } from "@/services/ai.service"

export default function AdminEventsPage() {
  const [events, setEvents] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = React.useState(false)
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = React.useState(false)
  const [isRewritingAI, setIsRewritingAI] = React.useState(false)

  const [editingId, setEditingId] = React.useState<string | null>(null)

  // Registrations state
  const [isRegDialogOpen, setIsRegDialogOpen] = React.useState(false)
  const [loadingRegs, setLoadingRegs] = React.useState(false)
  const [currentRegEventTitle, setCurrentRegEventTitle] = React.useState("")
  const [regList, setRegList] = React.useState<any[]>([])

  const [title, setTitle] = React.useState("")
  const [type, setType] = React.useState("")
  const [date, setDate] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [attendees, setAttendees] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [image, setImage] = React.useState("")

  const load = React.useCallback(async () => {
    setLoading(true)
    const data = await getEventsAdmin()
    setEvents(data)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const resetForm = () => {
    setTitle("")
    setType("")
    setDate("")
    setLocation("")
    setAttendees("")
    setDescription("")
    setImage("")
    setEditingId(null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    
    const res = await uploadEventBanner(formData)
    setIsUploading(false)
    if (res.error) {
      toast.error(res.error)
    } else if (res.url) {
      setImage(res.url)
      toast.success("Image uploaded successfully!")
    }
  }

  const handleAIGenerate = async () => {
    if (!title || !type || !location || !date) {
      toast.error("Please fill in Title, Type, Location, and Date first.")
      return
    }
    setIsGeneratingAI(true)
    const res = await generateEventDescription(title, type, location, date)
    setIsGeneratingAI(false)
    if (res.error) {
      toast.error(res.error)
    } else if (res.content) {
      setDescription(res.content)
      toast.success("AI generated a draft description!")
    }
  }

  const handleAIRewrite = async () => {
    if (!description) {
      toast.error("Please write a short description first.")
      return
    }
    setIsRewritingAI(true)
    const res = await rewriteEventDescription(description)
    setIsRewritingAI(false)
    if (res.error) {
      toast.error(res.error)
    } else if (res.content) {
      setDescription(res.content)
      toast.success("AI rewrote the description!")
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const res = await createEvent({
      title, type, date, location, attendees, description, image
    })
    setIsSubmitting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Event created successfully!")
      setIsSheetOpen(false)
      resetForm()
      load()
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    setIsSubmitting(true)
    const res = await updateEvent(editingId, {
      title, type, date, location, attendees, description, image
    })
    setIsSubmitting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Event updated successfully!")
      setIsEditSheetOpen(false)
      resetForm()
      load()
    }
  }

  const openEdit = (event: any) => {
    setEditingId(event.id)
    setTitle(event.title || "")
    setType(event.type || "")
    
    let localDate = ""
    if (event.date) {
      const d = new Date(event.date)
      if (!isNaN(d.getTime())) {
        localDate = d.toISOString().slice(0, 16)
      }
    }
    setDate(localDate)
    
    setLocation(event.location || "")
    setAttendees(event.attendees || "")
    setDescription(event.description || "")
    setImage(event.image || "")
    setIsEditSheetOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the event "${name}"?`)) return
    const res = await deleteEvent(id)
    if (res.error) toast.error(res.error)
    else {
      toast.success("Event deleted.")
      load()
    }
  }

  const handleViewRegistrations = async (eventId: string, title: string) => {
    setCurrentRegEventTitle(title)
    setRegList([])
    setIsRegDialogOpen(true)
    setLoadingRegs(true)
    
    const data = await getEventRegistrations(eventId)
    setRegList(data)
    setLoadingRegs(false)
  }

  const formFieldsUI = (
    <div className="flex flex-col gap-5 py-6">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">Event Title</label>
        <Input placeholder="e.g. Web3 Hackathon" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">Event Type</label>
        <Input placeholder="e.g. Hackathon, Workshop" value={type} onChange={e => setType(e.target.value)} required />
      </div>
      
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">Date & Time</label>
        <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required />
        <p className="text-[10px] text-muted-foreground mt-1">If editing, re-select the date/time.</p>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">Location</label>
        <Input placeholder="e.g. Innovation Hub / Online" value={location} onChange={e => setLocation(e.target.value)} required />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">Attendees Display Text</label>
        <Input placeholder="e.g. 500+ Registered" value={attendees} onChange={e => setAttendees(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">Event Banner</label>
        <div className="flex gap-2 items-center">
          <Input 
            type="file" 
            accept="image/*" 
            className="file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          {isUploading && <Loader2 className="animate-spin size-4 text-muted-foreground" />}
        </div>
        {image && <p className="text-[10px] text-green-600 truncate mt-1">✓ Image attached</p>}
      </div>

      <div className="space-y-2 mt-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground">Event Description</label>
          <div className="flex flex-wrap gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
              onClick={handleAIGenerate}
              disabled={isGeneratingAI || !title || !type || !location || !date}
            >
              {isGeneratingAI ? <Loader2 className="animate-spin size-3 mr-1" /> : <SparklesIcon className="size-3 mr-1" />}
              AI Draft
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300"
              onClick={handleAIRewrite}
              disabled={isRewritingAI || !description}
            >
              {isRewritingAI ? <Loader2 className="animate-spin size-3 mr-1" /> : <Wand2Icon className="size-3 mr-1" />}
              AI Rewrite
            </Button>
          </div>
        </div>
        <Textarea 
          placeholder="Detailed event description..." 
          className="min-h-[150px]"
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          required 
        />
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Events Management</h1>
          <p className="text-sm text-muted-foreground">Schedule and manage campus-wide events, workshops, and hackathons.</p>
        </div>
        
        <div>
          <Sheet open={isSheetOpen} onOpenChange={(open) => {
            setIsSheetOpen(open)
            if (!open) resetForm()
          }}>
            <SheetTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 size-4" />
                Create Event
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto w-full sm:max-w-md">
              <form onSubmit={handleCreate}>
                <SheetHeader>
                  <SheetTitle>Create New Event</SheetTitle>
                  <SheetDescription>
                    Enter details for the new event. Use the AI buttons to quickly generate or refine your description.
                  </SheetDescription>
                </SheetHeader>
                
                {formFieldsUI}

                <SheetFooter className="mt-4">
                  <Button type="submit" disabled={isSubmitting || isUploading || isGeneratingAI || isRewritingAI} className="w-full">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Event
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </section>

      <Sheet open={isEditSheetOpen} onOpenChange={(open) => {
        setIsEditSheetOpen(open)
        if (!open) resetForm()
      }}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-md">
          <form onSubmit={handleEdit}>
            <SheetHeader>
              <SheetTitle>Edit Event</SheetTitle>
              <SheetDescription>
                Update the event details below.
              </SheetDescription>
            </SheetHeader>

            {formFieldsUI}

            <SheetFooter className="mt-4">
              <Button type="submit" disabled={isSubmitting || isUploading || isGeneratingAI || isRewritingAI} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Event
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>All Events ({events.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex justify-center items-center">
               <Loader2 className="animate-spin text-muted-foreground size-6" />
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic text-sm">
              No events found. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="p-4">Event Details</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Registrations</th>
                    <th className="p-4">Location</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {event.image ? (
                            <img src={event.image} alt={event.title} className="size-10 object-cover rounded-md border shadow-sm" />
                          ) : (
                            <div className="size-10 bg-primary/10 rounded-md border flex items-center justify-center">
                              <ImagePlusIcon className="size-4 text-primary/50" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{event.title}</span>
                            <span className="text-xs text-muted-foreground">{event.type}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-muted-foreground">{event.date}</span>
                      </td>
                      <td className="p-4">
                        <Button 
                          variant="ghost" 
                          className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary hover:bg-primary/20 hover:text-primary transition-colors h-auto border-none"
                          onClick={() => handleViewRegistrations(event.id, event.title)}
                        >
                          {event.event_registrations?.[0]?.count || 0} Registered
                        </Button>
                      </td>
                      <td className="p-4 text-muted-foreground font-medium">{event.location}</td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => openEdit(event)}>
                          <EditIcon className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(event.id)}>
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

      <Dialog open={isRegDialogOpen} onOpenChange={setIsRegDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrations: {currentRegEventTitle}</DialogTitle>
            <DialogDescription>
              List of students who have registered for this event.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto mt-2">
            {loadingRegs ? (
              <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-muted-foreground size-6" />
              </div>
            ) : regList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center p-8">No students have registered yet.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground sticky top-0">
                  <tr>
                    <th className="p-2 font-medium">Name</th>
                    <th className="p-2 font-medium">NIAT ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {regList.map((reg) => (
                    <tr key={reg.id} className="hover:bg-muted/10">
                      <td className="p-2">{reg.students?.name || 'Unknown'}</td>
                      <td className="p-2 text-muted-foreground">{reg.students?.niat_id || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
