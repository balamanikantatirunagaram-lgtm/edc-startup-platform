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
import { getFundingOpportunities, createFundingOpportunity, deleteFundingOpportunity, updateFundingOpportunity } from "@/services/content.service"

export default function AdminFundingPage() {
  const [funding, setFunding] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Form State
  const [title, setTitle] = React.useState("")
  const [provider, setProvider] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [deadline, setDeadline] = React.useState("")
  const [type, setType] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [requirements, setRequirements] = React.useState("")
  const [link, setLink] = React.useState("")
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    const data = await getFundingOpportunities()
    setFunding(data)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const resetForm = () => {
    setTitle(""); setProvider(""); setAmount(""); setDeadline(""); setType(""); setDescription(""); setRequirements(""); setLink("")
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const reqArray = requirements.split(",").map(s => s.trim()).filter(Boolean)
    const payload = { title, provider, amount, deadline, type, description, requirements: reqArray, link }
    
    let res;
    if (editingId) {
      res = await updateFundingOpportunity(editingId, payload)
    } else {
      res = await createFundingOpportunity(payload)
    }
    
    setIsSubmitting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(editingId ? "Funding opportunity updated successfully" : "Funding opportunity created successfully")
      setIsDialogOpen(false)
      load()
      resetForm()
    }
  }

  const handleEdit = (item: any) => {
    setTitle(item.title)
    setProvider(item.provider)
    setAmount(item.amount)
    setDeadline(item.deadline)
    setType(item.type)
    setDescription(item.description || "")
    setRequirements((item.requirements || []).join(", "))
    setLink(item.link || "")
    setEditingId(item.id)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) return
    const res = await deleteFundingOpportunity(id)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Funding opportunity deleted")
      load()
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manage Funding</h1>
          <p className="text-sm text-muted-foreground">Add and remove funding opportunities for startups.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusIcon className="size-4" /> Add Opportunity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Funding Opportunity" : "Add New Funding Opportunity"}</DialogTitle>
                <DialogDescription>
                  {editingId ? "Update details for the funding or grant." : "Enter details for the new funding or grant."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input placeholder="Title (e.g. Seed Grant 2026)" value={title} onChange={e => setTitle(e.target.value)} required />
                <Input placeholder="Provider (e.g. Government, VC)" value={provider} onChange={e => setProvider(e.target.value)} required />
                <Input placeholder="Amount (e.g. ₹5,00,000)" value={amount} onChange={e => setAmount(e.target.value)} required />
                <Input placeholder="Type (e.g. Equity-free Grant)" value={type} onChange={e => setType(e.target.value)} required />
                <Input placeholder="Deadline (e.g. Oct 15, 2026)" value={deadline} onChange={e => setDeadline(e.target.value)} required />
                <Input placeholder="Requirements (comma separated)" value={requirements} onChange={e => setRequirements(e.target.value)} required />
                <Input placeholder="External Link (URL)" value={link} onChange={e => setLink(e.target.value)} />
                <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Update Opportunity" : "Save Opportunity"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Funding Opportunities ({funding.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex justify-center items-center">
               <Loader2 className="animate-spin text-muted-foreground size-6" />
            </div>
          ) : funding.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic text-sm">
              No funding opportunities found. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                    <th className="p-4">Title</th>
                    <th className="p-4">Amount & Provider</th>
                    <th className="p-4">Deadline</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {funding.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-medium">{item.title}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">{item.amount}</span>
                          <span>{item.provider}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{item.deadline}</td>
                      <td className="p-4 text-right space-x-2">
                        <Button variant="outline" size="sm" className="text-blue-500 hover:text-blue-600" onClick={() => handleEdit(item)}>
                          <PencilIcon className="size-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(item.id)}>
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
