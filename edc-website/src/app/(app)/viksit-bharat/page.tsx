"use client"

import { getMyStartup } from "@/services/startup.service"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getViksitBharatCategories, submitImpactScore } from "@/services/impact.service"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function ViksitBharatPage() {
  const [categories, setCategories] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchCategories() {
      const { categories: data } = await getViksitBharatCategories()
      setCategories(data || [])
      setLoading(false)
    }
    fetchCategories()
  }, [])

  return (
    <div className="flex flex-col gap-6 pb-10 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Viksit Bharat Impact</h1>
        <p className="text-muted-foreground">
          Align your startup's goals with the vision of Viksit Bharat and track your impact.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">Loading...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mt-4">
          {categories.map((category: any) => (
            <Card key={category.id} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-xl">{category.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-1 text-sm font-medium">
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Focus Areas: {category.focus_areas?.join(", ") || "N/A"}
                </p>
              </CardContent>
              <CardFooter className="pt-4 bg-muted/20 mt-auto">
                <SubmitImpactDialog category={category} />
              </CardFooter>
            </Card>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
              No categories found.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SubmitImpactDialog({ category }: { category: any }) {
  const [score, setScore] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [open, setOpen] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Fetch real startup ID
    const startupRes = await getMyStartup();
    if (!startupRes.startup) {
      toast.error("You must belong to a startup to submit impact.");
      return;
    }
    
    const startupId = startupRes.startup.id;
    const res = await submitImpactScore(startupId, category.id, parseInt(score, 10), description)
    if (res.success) {
      toast.success("Impact score submitted!")
      setOpen(false)
    } else {
      toast.error("Failed to submit score: " + res.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Submit Impact</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Impact for {category.name}</DialogTitle>
          <DialogDescription>
            Provide your self-assessed score (1-10) and describe how your startup contributes to this category.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Score (1-10)</label>
            <Input type="number" min="1" max="10" value={score} onChange={(e) => setScore(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
