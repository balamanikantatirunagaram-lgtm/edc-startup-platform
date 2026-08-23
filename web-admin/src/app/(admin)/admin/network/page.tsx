"use client"

import * as React from "react"
import { UsersIcon, BuildingIcon, Loader2, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  getInvestors, createInvestorAccount, deleteInvestor,
  getIncubators, createIncubator, deleteIncubator
} from "@/services/network.service"

function InvestorsTab() {
  const [investors, setInvestors] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    company_name: "",
    investment_stage: "",
    portfolio_size: "",
  })

  const load = async () => {
    setLoading(true)
    const data = await getInvestors()
    setInvestors(data)
    setLoading(false)
  }

  React.useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await createInvestorAccount({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        company_name: formData.company_name,
        investment_stage: formData.investment_stage.split(',').map(s => s.trim()).filter(Boolean),
        portfolio_size: formData.portfolio_size ? Number(formData.portfolio_size) : null
      })
      if (res?.error) {
        toast.error(res.error)
        return
      }
      toast.success("Investor added successfully")
      setIsDialogOpen(false)
      setFormData({ name: "", email: "", password: "", company_name: "", investment_stage: "", portfolio_size: "" })
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
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Investors</h2>
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
                  <label className="text-sm font-medium">Investor Name</label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Jane Investor" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Email (login account)</label>
                  <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="investor@example.com" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Temporary Password</label>
                  <Input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Min 6 characters" minLength={6} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Company / Firm Name</label>
                  <Input required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} placeholder="e.g. Sequoia Capital" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Investment Stage Focus (comma-separated)</label>
                  <Input value={formData.investment_stage} onChange={e => setFormData({...formData, investment_stage: e.target.value})} placeholder="e.g. Seed, Series A, Growth" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Portfolio Size</label>
                  <Input type="number" min={0} value={formData.portfolio_size} onChange={e => setFormData({...formData, portfolio_size: e.target.value})} placeholder="e.g. 25" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Investor
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                    <th className="p-4">Investment Stages</th>
                    <th className="p-4">Portfolio Size</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {investors.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-medium">{item.company_name}</td>
                      <td className="p-4 text-muted-foreground">{(item.investment_stage || []).join(', ') || '—'}</td>
                      <td className="p-4 text-muted-foreground">{item.portfolio_size ?? '—'}</td>
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

function IncubatorsTab() {
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

  React.useEffect(() => { load() }, [])

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
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Incubators</h2>
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
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Y Combinator" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Focus Areas (comma separated)</label>
                  <Input value={formData.focus_areas} onChange={e => setFormData({...formData, focus_areas: e.target.value})} placeholder="e.g. SaaS, DeepTech, AI" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Incubator
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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

export default function AdminNetworkPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Network Management</h1>
        <p className="text-sm text-muted-foreground">Manage the ecosystem of Investors and Incubators.</p>
      </section>

      <Tabs defaultValue="investors" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="investors" className="gap-2">
            <UsersIcon className="size-4" /> Investors
          </TabsTrigger>
          <TabsTrigger value="incubators" className="gap-2">
            <BuildingIcon className="size-4" /> Incubators
          </TabsTrigger>
        </TabsList>

        <TabsContent value="investors" className="mt-6">
          <InvestorsTab />
        </TabsContent>

        <TabsContent value="incubators" className="mt-6">
          <IncubatorsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
