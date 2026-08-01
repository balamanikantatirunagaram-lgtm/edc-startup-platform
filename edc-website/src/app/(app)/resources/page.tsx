import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Briefcase, FileSignature, PieChart, ExternalLink } from "lucide-react"
import { getResources } from "@/services/content.service"

export default async function ResourcesPage() {
  const resources = await getResources()

  // Group resources by category
  const groupedResources = resources.reduce((acc: any, resource: any) => {
    const category = resource.category || "General"
    if (!acc[category]) acc[category] = []
    acc[category].push(resource)
    return acc
  }, {})

  return (
    <div className="container max-w-6xl py-10 mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">Resource Center</h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          Everything you need to build, launch, and scale your startup. Download these curated templates and frameworks created by industry experts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.entries(groupedResources).map(([category, items]: [string, any]) => (
          <Card key={category} className="flex flex-col h-full border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4 bg-muted/20 border-b">
              <CardTitle className="text-2xl">{category}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ul className="divide-y divide-border">
                {items.map((item: any) => (
                  <li key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-muted/10 transition-colors gap-4">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-md mt-1 sm:mt-0 shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild className="shrink-0 h-8 w-8 text-muted-foreground hover:text-primary sm:self-center">
                      <a href={item.link} target="_blank" rel="noreferrer">
                        <Download className="w-4 h-4" />
                        <span className="sr-only">Download {item.title}</span>
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
        {resources.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            No resources available at the moment.
          </div>
        )}
      </div>
      
      <div className="mt-12 p-6 bg-primary/5 rounded-xl border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Need something else?</h3>
          <p className="text-muted-foreground">Check out the startup community forum or request a specific template.</p>
        </div>
        <Button className="shrink-0" variant="outline">
          Browse Forum <ExternalLink className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
