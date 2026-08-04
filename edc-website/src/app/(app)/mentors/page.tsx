import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getMentors } from "@/services/content.service"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { RequestMentorshipButton } from "@/components/shared/RequestMentorshipButton"

export default async function MentorsPage() {
  const mentors = await getMentors()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Mentor Connect</h1>
        <p className="text-muted-foreground">
          Schedule one-to-one guidance sessions with industry experts. Meetings will automatically be arranged via Google Meet.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mentors.map((mentor: any) => (
          <Card key={mentor.id} className="overflow-hidden flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4 bg-muted/50 pb-6">
              {mentor.image ? (
                 <img src={mentor.image} alt={mentor.name} className="size-16 rounded-full border-2 border-background shadow-sm object-cover" />
              ) : (
                <div className="size-16 rounded-full border-2 border-background shadow-sm bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                  {mentor.name.charAt(0)}
                </div>
              )}
              <div className="flex flex-col gap-1">
                <CardTitle className="text-lg">{mentor.name}</CardTitle>
                <CardDescription className="text-xs font-medium">
                  {mentor.role} at <span className="text-foreground">{mentor.company}</span>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1">
              <div className="flex flex-wrap gap-2 mb-4">
                {(mentor.expertise || []).map((exp: string) => (
                  <Badge key={exp} variant="secondary" className="font-normal text-xs">{exp}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Availability: </span>{mentor.availability}
              </p>
            </CardContent>
            <CardFooter>
               <RequestMentorshipButton mentorId={mentor.id} />
            </CardFooter>
          </Card>
        ))}
        {mentors.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            No mentors available at the moment.
          </div>
        )}
      </div>
    </div>
  )
}
