"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PopupButton } from "react-calendly"
import { useState, useEffect } from "react"

// Mock mentors list
const MENTORS = [
  {
    id: "m1",
    name: "Dr. Vikram Singh",
    expertise: ["AI/ML", "EdTech", "B2B SaaS"],
    company: "TechVentures",
    role: "Chief Technology Officer",
    image: "https://i.pravatar.cc/150?u=vikram",
    calendlyUrl: "https://calendly.com/your-calendly-link" // Replace with actual Calendly links
  },
  {
    id: "m2",
    name: "Priya Desai",
    expertise: ["Marketing", "Growth Hacking", "D2C"],
    company: "GrowthX",
    role: "Marketing Director",
    image: "https://i.pravatar.cc/150?u=priya",
    calendlyUrl: "https://calendly.com/your-calendly-link"
  },
  {
    id: "m3",
    name: "Rahul Verma",
    expertise: ["Fundraising", "FinTech", "Strategy"],
    company: "Capital Partners",
    role: "Venture Partner",
    image: "https://i.pravatar.cc/150?u=rahul",
    calendlyUrl: "https://calendly.com/your-calendly-link"
  }
]

export default function MentorsPage() {
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    // react-calendly requires a root element for the popup widget to append to securely
    setRootElement(document.getElementById('__next') || document.body)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Mentor Connect</h1>
        <p className="text-muted-foreground">
          Schedule one-to-one guidance sessions with industry experts. Meetings will automatically be arranged via Google Meet.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MENTORS.map(mentor => (
          <Card key={mentor.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4 bg-muted/50 pb-6">
              <img src={mentor.image} alt={mentor.name} className="size-16 rounded-full border-2 border-background shadow-sm" />
              <div className="flex flex-col gap-1">
                <CardTitle className="text-lg">{mentor.name}</CardTitle>
                <CardDescription className="text-xs font-medium">
                  {mentor.role} at <span className="text-foreground">{mentor.company}</span>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {mentor.expertise.map(exp => (
                  <Badge key={exp} variant="secondary" className="font-normal text-xs">{exp}</Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              {rootElement && (
                <div className="w-full">
                  <PopupButton
                    url={mentor.calendlyUrl}
                    rootElement={rootElement}
                    text="Book Session (GMeet)"
                    className="w-full h-10 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90"
                  />
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
