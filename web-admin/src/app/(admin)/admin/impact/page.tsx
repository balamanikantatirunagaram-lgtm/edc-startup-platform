"use client"

import * as React from "react"
import { Loader2, TrendingUpIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getImpactScores } from "@/services/impact.service"

export default function AdminImpactPage() {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      const res = await getImpactScores()
      
      // Calculate sums per category
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
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Impact Dashboard</h1>
        <p className="text-sm text-muted-foreground">View overall startup impact across Viksit Bharat categories.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
           <div className="col-span-full p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground size-6" /></div>
        ) : data && data.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground italic text-sm">No impact categories found.</div>
        ) : (
          data?.map((cat: any) => (
            <Card key={cat.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between">
                  {cat.name}
                  <TrendingUpIcon className="size-4 text-green-500" />
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
