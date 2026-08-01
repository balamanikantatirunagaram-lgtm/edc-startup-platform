import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"
import { getEvents, getUserRegistrations } from "@/services/content.service"
import { RegisterEventButton } from "@/components/shared/RegisterEventButton"

export default async function EventsPage() {
  const [events, registeredEventIds] = await Promise.all([
    getEvents(),
    getUserRegistrations()
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Events & Competitions</h1>
        <p className="text-muted-foreground">
          Discover and register for upcoming workshops, hackathons, ideathons, and startup competitions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {events.map((event: any) => (
          <Card key={event.id} className="overflow-hidden flex flex-col">
            {event.image && (
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" 
                />
              </div>
            )}
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
                {event.attendees && (
                  <div className="flex items-center gap-2">
                    <Users className="size-4" />
                    <span>{event.attendees}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t">
              <RegisterEventButton eventId={event.id} isRegisteredInitial={registeredEventIds.includes(event.id)} />
            </CardFooter>
          </Card>
        ))}
        {events.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            No upcoming events at the moment. Check back later!
          </div>
        )}
      </div>
    </div>
  )
}
