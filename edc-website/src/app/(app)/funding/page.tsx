import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Rocket } from "lucide-react"
import { getFundingOpportunities } from "@/services/content.service"

export default async function FundingPage() {
  const fundingOpportunities = await getFundingOpportunities()

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Funding & Support</h1>
        <p className="text-muted-foreground">
          Explore government schemes, grants, investors, and incubators to accelerate your startup's growth.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2 mt-4">
        {fundingOpportunities.map((item: any) => (
          <Card key={item.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start gap-4 mb-2">
                <Badge variant="outline" className="font-medium bg-primary/5 text-primary border-primary/20">
                  {item.type}
                </Badge>
                <Badge variant="secondary" className="font-semibold">
                  {item.amount}
                </Badge>
              </div>
              <CardTitle className="text-xl">{item.title}</CardTitle>
              <CardDescription className="flex items-center gap-1.5 mt-1 text-sm font-medium">
                <Rocket className="size-3.5" />
                {item.provider}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <p className="text-sm text-foreground/80 leading-relaxed">
                {item.description}
              </p>
              <div className="mt-auto pt-4 border-t border-border/50">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Requirements</span>
                <ul className="text-sm mt-1.5 list-disc pl-4 text-muted-foreground">
                  {(item.requirements || []).filter((req: string) => !req.startsWith('__LINK__:')).map((req: string, i: number) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="pt-4 bg-muted/20">
              {(() => {
                const reqs = item.requirements || [];
                const linkIndex = reqs.findIndex((r: string) => r.startsWith('__LINK__:'));
                const actualLink = linkIndex > -1 ? reqs[linkIndex].substring(9) : item.link;
                
                return actualLink ? (
                  <a href={actualLink} target="_blank" rel="noreferrer" className="w-full">
                    <Button variant="default" className="w-full gap-2">
                      Apply / View Details
                      <ExternalLink className="size-4" />
                    </Button>
                  </a>
                ) : (
                  <Button variant="default" className="w-full gap-2">
                    Apply / View Details
                    <ExternalLink className="size-4" />
                  </Button>
                )
              })()}
            </CardFooter>
          </Card>
        ))}
        {fundingOpportunities.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            No funding opportunities listed at the moment.
          </div>
        )}
      </div>
    </div>
  )
}
