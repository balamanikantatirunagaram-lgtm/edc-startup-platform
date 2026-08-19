"use client"

import * as React from "react"
import { BuildingIcon, Loader2, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { getIncubators, createIncubator, deleteIncubator } from "@/services/network.service"

export default function AdminIncubatorsPage() {
  const [incubators, setIncubators] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [formData, setFormData] = React.useState({
    name: "",
    focus_areas: "",
  })

  const load = async () => {
    setLoading(true)
    const data = await getIncubators()
    setIncubators(data)
    setLoading(false)
  }

  React.useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createIncubator({
        name: formData.name,
        focus_areas: formData.focus_areas.split(',').map(s => s.trim()).filter(Boolean),
      })
      toast.success("Incubator added successfully")
      setIsDialogOpen(false)
      setFormData({ name: "", focus_areas: "" })
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to add incubator")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    try {
      await deleteIncubator(id)
      toast.success("Incubator deleted")
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Incubators</h1>
          <p className="text-sm text-muted-foreground">Manage startup incubators and their focus areas.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="gap-2" />}>
            <PlusIcon className="size-4" /> Add Incubator
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add Incubator</DialogTitle>
                <DialogDescription>Add a new incubator to the network.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="e.g. Y Combinator" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Focus Areas (comma separated)</label>
                  <Input 
                    value={formData.focus_areas} 
                    onChange={e => setFormData({...formData, focus_areas: e.target.value})} 
                    placeholder="e.g. SaaS, DeepTech, AI" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Incubator
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Incubators ({incubators.length})</CardTitle>
          <CardDescription>Organizations that support startups.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground size-6" /></div>
          ) : incubators.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic text-sm">No incubators found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                    <th className="p-4">Name</th>
                    <th className="p-4">Focus Areas</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {incubators.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-medium">{item.name}</td>
                      <td className="p-4 text-muted-foreground">{item.focus_areas?.join(', ') || '-'}</td>
                      <td className="p-4 text-right">
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                          <Trash2Icon className="size-4 mr-2" /> Delete
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
