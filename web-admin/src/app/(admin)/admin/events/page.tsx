"use client"

import * as React from "react"
import { Trash2Icon, PlusIcon, Loader2, EditIcon } from "lucide-react"
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
import { getEvents, createEvent, deleteEvent, updateEvent, getEventRegistrations } from "@/services/content.service"

export default function AdminEventsPage() {
  const [events, setEvents] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  // Registrations state
  const [isRegDialogOpen, setIsRegDialogOpen] = React.useState(false)
  const [loadingRegs, setLoadingRegs] = React.useState(false)
  const [currentRegEventTitle, setCurrentRegEventTitle] = React.useState("")
  const [regList, setRegList] = React.useState<any[]>([])

  // Form State
  const [title, setTitle] = React.useState("")
  const [type, setType] = React.useState("")
  const [date, setDate] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [attendees, setAttendees] = React.useState("")
  const [image, setImage] = React.useState("")

  const load = React.useCallback(async () => {
    setLoading(true)
    const data = await getEvents()
    setEvents(data)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const res = await createEvent({
      title, type, date, location, description, attendees, image
    })
    setIsSubmitting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Event created successfully")
      setIsDialogOpen(false)
      load()
      // reset form
      setTitle(""); setType(""); setDate(""); setLocation(""); setDescription(""); setAttendees(""); setImage("")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return
    const res = await deleteEvent(id)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Event deleted")
      load()
    }
  }

  const openEdit = (event: any) => {
    setEditingId(event.id)
    setTitle(event.title)
    setType(event.type)
    setDate(event.date)
    setLocation(event.location)
    setDescription(event.description)
    setAttendees(event.attendees)
    setImage(event.image || "")
    setIsEditDialogOpen(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    setIsSubmitting(true)
    const res = await updateEvent(editingId, {
      title, type, date, location, description, attendees, image
    })
    setIsSubmitting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Event updated successfully")
      setIsEditDialogOpen(false)
      load()
    }
  }

  const handleViewRegistrations = async (eventId: string, eventTitle: string) => {
    setCurrentRegEventTitle(eventTitle)
    setIsRegDialogOpen(true)
    setLoadingRegs(true)
    const data = await getEventRegistrations(eventId)
    setRegList(data)
    setLoadingRegs(false)
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manage Events</h1>
          <p className="text-sm text-muted-foreground">Add and remove events shown on the student portal.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="gap-2" />}>
            <PlusIcon className="size-4" /> Add Event
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>
                  Enter details for the new event. It will be immediately visible on the website.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input placeholder="Event Title (e.g. Web3 Hackathon)" value={title} onChange={e => setTitle(e.target.value)} required />
                <Input placeholder="Type (e.g. Hackathon, Workshop)" value={type} onChange={e => setType(e.target.value)} required />
                <Input placeholder="Date (e.g. August 15-17, 2026)" value={date} onChange={e => setDate(e.target.value)} required />
                <Input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} required />
                <Input placeholder="Attendees (e.g. 500+ Registered)" value={attendees} onChange={e => setAttendees(e.target.value)} />
                <Input placeholder="Image URL (optional)" value={image} onChange={e => setImage(e.target.value)} />
                <Textarea placeholder="Event Description" value={description} onChange={e => setDescription(e.target.value)} required />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Event
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleEdit}>
              <DialogHeader>
                <DialogTitle>Edit Event</DialogTitle>
                <DialogDescription>
                  Update the event details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input placeholder="Event Title (e.g. Web3 Hackathon)" value={title} onChange={e => setTitle(e.target.value)} required />
                <Input placeholder="Type (e.g. Hackathon, Workshop)" value={type} onChange={e => setType(e.target.value)} required />
                <Input placeholder="Date (e.g. August 15-17, 2026)" value={date} onChange={e => setDate(e.target.value)} required />
                <Input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} required />
                <Input placeholder="Attendees (e.g. 500+ Registered)" value={attendees} onChange={e => setAttendees(e.target.value)} />
                <Input placeholder="Image URL (optional)" value={image} onChange={e => setImage(e.target.value)} />
                <Textarea placeholder="Event Description" value={description} onChange={e => setDescription(e.target.value)} required />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Event
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Events ({events.length})</CardTitle>
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
                  <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                    <th className="p-4">Title</th>
                    <th className="p-4">Type & Date</th>
                    <th className="p-4">Registrations</th>
                    <th className="p-4">Location</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-medium">{event.title}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          <span>{event.type}</span>
                          <span>{event.date}</span>
                        </div>
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
                      <td className="p-4 text-muted-foreground">{event.location}</td>
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
