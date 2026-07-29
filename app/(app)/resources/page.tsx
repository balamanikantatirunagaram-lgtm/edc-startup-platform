import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Briefcase, FileSignature, PieChart, ExternalLink } from "lucide-react"
import Link from "next/link"

const resourceCategories = [
  {
    title: "Pitch Deck Templates",
    description: "Standard templates for investor pitches and presentations.",
    icon: <PieChart className="w-10 h-10 text-blue-500 mb-4" />,
    items: [
      { name: "Seed Round Pitch Deck", size: "2.4 MB", type: "PPTX", link: "#" },
      { name: "Y-Combinator Style Template", size: "1.1 MB", type: "PDF", link: "#" },
      { name: "Elevator Pitch One-Pager", size: "0.5 MB", type: "DOCX", link: "#" },
    ]
  },
  {
    title: "Business Model Templates",
    description: "Canvases and frameworks for structuring your business.",
    icon: <Briefcase className="w-10 h-10 text-indigo-500 mb-4" />,
    items: [
      { name: "Business Model Canvas", size: "1.2 MB", type: "PDF", link: "#" },
      { name: "Lean Canvas Template", size: "1.0 MB", type: "PDF", link: "#" },
      { name: "Competitor Analysis Framework", size: "0.8 MB", type: "XLSX", link: "#" },
    ]
  },
  {
    title: "Legal Documents",
    description: "Standard agreements and legal paperwork for early-stage startups.",
    icon: <FileSignature className="w-10 h-10 text-emerald-500 mb-4" />,
    items: [
      { name: "Non-Disclosure Agreement (NDA)", size: "0.3 MB", type: "DOCX", link: "#" },
      { name: "Founder Agreement", size: "0.4 MB", type: "DOCX", link: "#" },
      { name: "SAFE Note Template", size: "0.5 MB", type: "PDF", link: "#" },
    ]
  },
  {
    title: "Financial Templates",
    description: "Financial modeling, cap tables, and projection spreadsheets.",
    icon: <FileText className="w-10 h-10 text-amber-500 mb-4" />,
    items: [
      { name: "3-Year Financial Projections", size: "1.8 MB", type: "XLSX", link: "#" },
      { name: "Startup Cap Table", size: "1.5 MB", type: "XLSX", link: "#" },
      { name: "Unit Economics Calculator", size: "1.1 MB", type: "XLSX", link: "#" },
    ]
  }
]

export default function ResourcesPage() {
  return (
    <div className="container max-w-6xl py-10 mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">Resource Center</h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          Everything you need to build, launch, and scale your startup. Download these curated templates and frameworks created by industry experts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {resourceCategories.map((category, index) => (
          <Card key={index} className="flex flex-col h-full border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4 bg-muted/20 border-b">
              {category.icon}
              <CardTitle className="text-2xl">{category.title}</CardTitle>
              <CardDescription className="text-base">{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ul className="divide-y divide-border">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.type} • {item.size}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" nativeButton={false} render={<a href={item.link} download />} className="shrink-0 h-8 w-8 text-muted-foreground hover:text-primary">
                      <Download className="w-4 h-4" />
                      <span className="sr-only">Download {item.name}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
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
