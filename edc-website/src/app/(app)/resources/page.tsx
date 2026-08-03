import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { ExternalLink, FileText } from "lucide-react"
import { getResources } from "@/services/content.service"
import { cn } from "@/lib/utils"

export default async function ResourcesPage() {
  const resources = await getResources()

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Resource Center</h1>
        <p className="text-muted-foreground">
          Everything you need to build, launch, and scale your startup. Download these curated templates and frameworks created by industry experts.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2 mt-4">
        {resources.map((item: any) => (
          <Card key={item.id} className="flex flex-col h-full">
            <CardHeader>
              <div className="flex justify-between items-start gap-4 mb-2">
                <Badge variant="outline" className="font-medium bg-primary/5 text-primary border-primary/20">
                  {item.category || "General"}
                </Badge>
              </div>
              <CardTitle className="text-xl">{item.title}</CardTitle>
              <CardDescription className="flex items-center gap-1.5 mt-1 text-sm font-medium">
                <FileText className="size-3.5" />
                Resource Document
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <p className="text-sm text-foreground/80 leading-relaxed">
                {item.description}
              </p>
            </CardContent>
            <CardFooter className="pt-4 bg-muted/20 mt-auto">
              {(() => {
                let finalLink = item.link;
                if (finalLink && !finalLink.startsWith('http://') && !finalLink.startsWith('https://')) {
                  finalLink = 'https://' + finalLink;
                }
                
                return finalLink ? (
                  <a href={finalLink} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "default" }), "w-full gap-2")}>
                    View Resource
                    <ExternalLink className="size-4" />
                  </a>
                ) : (
                  <Button variant="secondary" className="w-full gap-2" disabled>
                    No Link Provided
                  </Button>
                )
              })()}
            </CardFooter>
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
