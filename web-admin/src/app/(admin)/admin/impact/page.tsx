"use client"

import * as React from "react"
import { Loader2, TrendingUpIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { getImpactScores, createImpactCategory, deleteImpactCategory } from "@/services/impact.service"

export default function AdminImpactPage() {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [formData, setFormData] = React.useState({
    name: "",
    description: ""
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await getImpactScores()
      
      const sums: Record<string, number> = {}
      res.categories.forEach((c: any) => {
        sums[c.id] = 0
      })
      
      res.scores.forEach((s: any) => {
        if (sums[s.category_id] !== undefined) {
          sums[s.category_id] += (s.score || 0)
        }
      })

      const agg = res.categories.map((c: any) => ({
        ...c,
        total_score: sums[c.id]
      })).sort((a: any, b: any) => b.total_score - a.total_score)

      setData(agg)
    } catch (err: any) {
      console.error(err)
    }
    setLoading(false)
  }

  React.useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createImpactCategory(formData)
      toast.success("Category added successfully")
      setIsDialogOpen(false)
      setFormData({ name: "", description: "" })
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to add category")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Delete this impact category? All associated startup scores will be lost.")) return
    try {
      await deleteImpactCategory(id)
      toast.success("Category deleted")
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Impact Dashboard</h1>
          <p className="text-sm text-muted-foreground">View overall startup impact across Viksit Bharat categories.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="gap-2" />}>
            <PlusIcon className="size-4" /> Add Category
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add Impact Category</DialogTitle>
                <DialogDescription>Create a new Viksit Bharat goal or impact area.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Category Name</label>
                  <Input 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="e.g. Digital India, Sustainability..." 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input 
                    required
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    placeholder="Brief description of the impact area..." 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Category
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
           <div className="col-span-full p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground size-6" /></div>
        ) : data && data.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground italic text-sm">No impact categories found. Click 'Add Category' to start tracking impact.</div>
        ) : (
          data?.map((cat: any) => (
            <Card key={cat.id} className="relative group overflow-hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={(e) => handleDelete(cat.id, e)}
              >
                <Trash2Icon className="size-4" />
              </Button>
              <CardHeader className="pb-2 pr-10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUpIcon className="size-4 text-green-500" />
                  {cat.name}
                </CardTitle>
                <CardDescription className="line-clamp-2">{cat.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{cat.total_score}</div>
                <p className="text-xs text-muted-foreground mt-1">Total Impact Score</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
