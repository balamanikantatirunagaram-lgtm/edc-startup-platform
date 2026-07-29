"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Building2, Landmark, Banknote, Users, Rocket } from "lucide-react"

const FUNDING_DATA = {
  schemes: [
    {
      id: "s1",
      title: "Startup India Seed Fund Scheme",
      provider: "DPIIT",
      amount: "Up to ₹50 Lakhs",
      type: "Seed Fund",
      description: "Financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialization.",
      eligibility: "DPIIT recognized startups incorporated within the last 2 years.",
      link: "#"
    },
    {
      id: "s2",
      title: "CGTMSE Scheme",
      provider: "Ministry of MSME",
      amount: "Up to ₹2 Crores",
      type: "Credit Guarantee",
      description: "Collateral-free credit to micro and small enterprises. Both term loans and working capital facility are covered.",
      eligibility: "New and existing Micro and Small Enterprises.",
      link: "#"
    }
  ],
  grants: [
    {
      id: "g1",
      title: "NIDHI-PRAYAS",
      provider: "DST",
      amount: "Up to ₹10 Lakhs",
      type: "Prototyping Grant",
      description: "Grant to help young innovators turn their ideas into proof-of-concept/prototypes.",
      eligibility: "Individual innovators or founders of early-stage startups.",
      link: "#"
    },
    {
      id: "g2",
      title: "BIG (Biotechnology Ignition Grant)",
      provider: "BIRAC",
      amount: "Up to ₹50 Lakhs",
      type: "Innovation Grant",
      description: "Supports biotechnology entrepreneurs to establish proof-of-concept for their high-impact ideas.",
      eligibility: "Biotech startups and individual scientists/entrepreneurs.",
      link: "#"
    }
  ],
  investors: [
    {
      id: "i1",
      title: "Peak XV Partners (Sequoia India)",
      provider: "Venture Capital",
      amount: "Seed to Series C+",
      type: "Equity",
      description: "Leading venture capital firm investing in technology, consumer, and financial services startups.",
      eligibility: "High-growth potential startups across sectors.",
      link: "#"
    },
    {
      id: "i2",
      title: "Indian Angel Network",
      provider: "Angel Network",
      amount: "₹1-5 Crores",
      type: "Equity",
      description: "One of the world's largest angel investor networks, investing in early-stage businesses.",
      eligibility: "Early-stage startups with a scalable business model.",
      link: "#"
    }
  ],
  incubators: [
    {
      id: "inc1",
      title: "T-Hub",
      provider: "Hyderabad",
      amount: "Mentorship & Resources",
      type: "Incubator",
      description: "India's pioneering innovation ecosystem that powers next-generation products and new business models.",
      eligibility: "Tech startups looking for scaling and market access.",
      link: "#"
    },
    {
      id: "inc2",
      title: "CIIE.CO",
      provider: "IIM Ahmedabad",
      amount: "Seed Funding + Incubation",
      type: "Incubator",
      description: "The Innovation Continuum spreading across incubation, acceleration, seed, and growth funding.",
      eligibility: "Deep tech, cleantech, and inclusion-focused startups.",
      link: "#"
    }
  ]
}

export default function FundingPage() {
  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Funding & Support</h1>
        <p className="text-muted-foreground">
          Explore government schemes, grants, investors, and incubators to accelerate your startup's growth.
        </p>
      </div>

      <Tabs defaultValue="schemes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
          <TabsTrigger value="schemes" className="gap-2">
            <Landmark className="size-4 hidden sm:block" />
            Govt. Schemes
          </TabsTrigger>
          <TabsTrigger value="grants" className="gap-2">
            <Banknote className="size-4 hidden sm:block" />
            Grants
          </TabsTrigger>
          <TabsTrigger value="investors" className="gap-2">
            <Users className="size-4 hidden sm:block" />
            Investors
          </TabsTrigger>
          <TabsTrigger value="incubators" className="gap-2">
            <Building2 className="size-4 hidden sm:block" />
            Incubators
          </TabsTrigger>
        </TabsList>

        {Object.entries(FUNDING_DATA).map(([key, items]) => (
          <TabsContent key={key} value={key} className="mt-0">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
              {items.map((item) => (
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
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Eligibility</span>
                      <p className="text-sm mt-1.5">{item.eligibility}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 bg-muted/20">
                    <Button variant="default" className="w-full gap-2">
                      Apply / View Details
                      <ExternalLink className="size-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
