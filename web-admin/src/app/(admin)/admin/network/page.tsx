"use client"

import * as React from "react"
import { UsersIcon, Loader2, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { getInvestors, createInvestor, deleteInvestor } from "@/services/network.service"

export default function AdminNetworkPage() {
  const [investors, setInvestors] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [formData, setFormData] = React.useState({
    company_name: "",
    investment_size: "",
  })

  const load = async () => {
    setLoading(true)
    const data = await getInvestors()
    setInvestors(data)
    setLoading(false)
  }

  React.useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // In a real app, user_id might link to a registered user, but here we just store the company
      await createInvestor({
        company_name: formData.company_name,
        investment_size: formData.investment_size,
        user_id: formData.company_name.replace(/\s+/g, '').toLowerCase() + '_id',
        experience: 'Seed Stage'
      })
      toast.success("Investor added successfully")
      setIsDialogOpen(false)
      setFormData({ company_name: "", investment_size: "" })
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to add investor")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    try {
      await deleteInvestor(id)
      toast.success("Investor deleted")
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Investor Network</h1>
          <p className="text-sm text-muted-foreground">Manage angel investors and venture capitalists.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="gap-2" />}>
            <PlusIcon className="size-4" /> Add Investor
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add Investor</DialogTitle>
                <DialogDescription>Add a new investor to the network.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Company / Firm Name</label>
                  <Input 
                    required 
                    value={formData.company_name} 
                    onChange={e => setFormData({...formData, company_name: e.target.value})} 
                    placeholder="e.g. Sequoia Capital" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Investment Size Focus</label>
                  <Input 
                    required
                    value={formData.investment_size} 
                    onChange={e => setFormData({...formData, investment_size: e.target.value})} 
                    placeholder="e.g. $100K - $1M" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Investor
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Investors ({investors.length})</CardTitle>
          <CardDescription>People and firms who fund startups.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground size-6" /></div>
          ) : investors.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic text-sm">No investors found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                    <th className="p-4">Name/Company</th>
                    <th className="p-4">Investment Size</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {investors.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-medium">{item.company_name}</td>
                      <td className="p-4 text-muted-foreground">{item.investment_size}</td>
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
