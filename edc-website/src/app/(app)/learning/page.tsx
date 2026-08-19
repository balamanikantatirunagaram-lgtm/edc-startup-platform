"use client"

import * as React from "react"
import Link from "next/link"
import { BookOpenIcon, ClockIcon, Loader2, PlayCircleIcon, UserIcon, ArrowRightIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAllCourses } from "@/services/learning.service"

export default function LearningHubPage() {
  const [courses, setCourses] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      const data = await getAllCourses()
      setCourses(data)
      setLoading(false)
    }
    load()
  }, [])

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
          <h1 className="text-3xl font-bold tracking-tight">Learning Hub</h1>
          <p className="text-muted-foreground max-w-2xl">
            Master the skills you need to build, launch, and scale your startup. Watch masterclasses, tutorials, and expert talks directly from mentors and industry leaders.
          </p>
        </div>
      </section>

      {courses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BookOpenIcon className="size-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No courses available yet</h2>
            <p className="text-muted-foreground max-w-md">
              Our mentors and admins are currently recording fresh masterclasses for you. Check back soon!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-md transition-all group flex flex-col border border-border/50 bg-card/50">
              <div className="relative h-44 bg-muted flex shrink-0">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                    <BookOpenIcon className="size-10 text-primary/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60"></div>
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <Badge className="bg-primary/90 hover:bg-primary border-0 shadow-sm backdrop-blur-md">
                    {course.category || "Masterclass"}
                  </Badge>
                  {course.duration && (
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-md text-foreground border-0 gap-1 shadow-sm">
                      <ClockIcon className="size-3" /> {course.duration}
                    </Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <h3 className="font-semibold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-1">
                  {course.description}
                </p>
                <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <UserIcon className="size-3.5" />
                      <span className="line-clamp-1 font-medium text-foreground">{course.instructor || "Expert"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <PlayCircleIcon className="size-3.5" />
                      <span>{course.course_modules?.[0]?.count || 0} Modules</span>
                    </div>
                  </div>
                  <Button onClick={() => window.location.href = `/learning/${course.id}`} className="w-full group/btn relative overflow-hidden">
                    Start Learning
                    <ArrowRightIcon className="ml-2 size-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
