"use client"

import * as React from "react"
import { ExternalLinkIcon, FileTextIcon, Loader2, BookOpenIcon, LinkIcon, VideoIcon, SearchIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getResources } from "@/services/content.service"

export default function StudentResourcesPage() {
  const [resources, setResources] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    async function load() {
      const data = await getResources()
      setResources(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = resources.filter(r => 
    r.title?.toLowerCase().includes(search.toLowerCase()) || 
    r.description?.toLowerCase().includes(search.toLowerCase()) ||
    r.category?.toLowerCase().includes(search.toLowerCase())
  )

  const getIcon = (name: string) => {
    switch (name?.toLowerCase()) {
      case 'video': return <VideoIcon className="size-5 text-foreground" />
      case 'link': return <LinkIcon className="size-5 text-muted-foreground" />
      case 'book': return <BookOpenIcon className="size-5 text-foreground" />
      case 'filetext':
      default: return <FileTextIcon className="size-5 text-primary" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20 min-h-[50vh]">
        <Loader2 className="animate-spin text-muted-foreground size-8" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Resources & Templates</h1>
          <p className="text-muted-foreground max-w-2xl">
            Access essential startup guides, pitch deck templates, and external tools to accelerate your growth.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search resources..." 
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileTextIcon className="size-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No resources found</h2>
            <p className="text-muted-foreground max-w-md">
              {search ? "Try adjusting your search terms." : "The admin hasn't added any external resources or templates yet."}
            </p>
            {search && (
              <Button variant="outline" className="mt-4" onClick={() => setSearch("")}>Clear Search</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((resource) => (
            <Card key={resource.id} className="group overflow-hidden flex flex-col hover:shadow-md transition-all border border-border/50 bg-card/50">
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="size-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    {getIcon(resource.icon)}
                  </div>
                  <Badge variant="secondary" className="font-normal text-xs">{resource.category}</Badge>
                </div>
                
                <h3 className="font-semibold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {resource.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-1 mb-4">
                  {resource.description}
                </p>
                
                <Button asChild variant="outline" className="w-full mt-auto group-hover:border-primary/50 group-hover:bg-primary/5 transition-colors">
                  <a href={resource.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    Open Resource
                    <ExternalLinkIcon className="size-3.5" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
