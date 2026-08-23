"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Building2, MapPin } from "lucide-react"
import { getIncubators } from "@/services/funding.service"

export default function IncubatorsPage() {
  const [incubators, setIncubators] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchIncubators() {
      const { incubators: data } = await getIncubators()
      setIncubators(data || [])
      setLoading(false)
    }
    fetchIncubators()
  }, [])

  return (
    <div className="flex flex-col gap-6 pb-10 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Incubators</h1>
        <p className="text-muted-foreground">
          Find and apply to incubators that match your startup's needs.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">Loading...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mt-4">
          {incubators.map((item: any) => (
            <Card key={item.id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  {(item.focus_areas || []).slice(0, 2).map((area: string) => (
                    <Badge key={area} variant="outline" className="font-medium bg-primary/5 text-primary border-primary/20">
                      {area}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="text-xl">{item.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-1 text-sm font-medium">
                  <MapPin className="size-3.5" />
                  {item.location || "Remote"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                {(item.focus_areas || []).length > 2 && (
                  <p className="text-xs text-muted-foreground">
                    Focus: {item.focus_areas.join(" · ")}
                  </p>
                )}
              </CardContent>
              <CardFooter className="pt-4 bg-muted/20 mt-auto flex flex-col gap-2">
                <Link href="/funding" className="w-full">
                  <Button className="w-full gap-2">
                    View Funding Opportunities
                  </Button>
                </Link>
                <p className="text-xs text-center text-muted-foreground">
                  Incubator applications are handled through active funding listings.
                </p>
              </CardFooter>
            </Card>
          ))}
          {incubators.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
              No incubators listed at the moment.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
