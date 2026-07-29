"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Trophy } from "lucide-react"

const EVENTS = [
  {
    id: "e1",
    title: "Web3 Builders Hackathon",
    type: "Hackathon",
    date: "August 15-17, 2026",
    location: "Tech Hub, Bangalore (Hybrid)",
    description: "Join the biggest Web3 hackathon in the region. Build decentralized applications and win prizes worth $50,000.",
    attendees: "500+ Registered",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "e2",
    title: "AI Startup Masterclass",
    type: "Workshop",
    date: "August 22, 2026",
    location: "Virtual",
    description: "Learn how to build, scale, and fund your AI startup from industry experts and successful founders.",
    attendees: "200+ Registered",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "e3",
    title: "National Ideathon 2026",
    type: "Ideathon",
    date: "September 5, 2026",
    location: "Innovation Center, Mumbai",
    description: "Pitch your revolutionary startup ideas to a panel of top investors and get seed funding.",
    attendees: "1000+ Participants",
    image: "https://images.unsplash.com/photo-1558403194-611308249627?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "e4",
    title: "SaaS Pitch Competition",
    type: "Startup Competition",
    date: "September 15, 2026",
    location: "Convention Center, Delhi",
    description: "A premier pitch competition for early-stage B2B SaaS startups looking for Pre-Seed to Seed funding.",
    attendees: "50 Startups",
    image: "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=600&auto=format&fit=crop"
  }
]

export default function EventsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Events & Competitions</h1>
        <p className="text-muted-foreground">
          Discover and register for upcoming workshops, hackathons, ideathons, and startup competitions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {EVENTS.map(event => (
          <Card key={event.id} className="overflow-hidden flex flex-col">
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" 
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start gap-4 mb-2">
                <Badge variant="secondary" className="font-semibold">
                  {event.type}
                </Badge>
              </div>
              <CardTitle className="text-xl line-clamp-1">{event.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-2 text-sm">
                {event.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="size-4" />
                  <span>{event.attendees}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t">
              <Button className="w-full gap-2">
                Register Now
                <Trophy className="size-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
