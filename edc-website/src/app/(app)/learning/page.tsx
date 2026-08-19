"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlayCircle, Clock, BookOpen, GraduationCap, CheckCircle2 } from "lucide-react"
import { getCourses, getMyCourseEnrollments } from "@/services/content.service"

export default function LearningHubPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const fetchedCourses = await getCourses()
      const enrollments = await getMyCourseEnrollments()
      
      const merged = fetchedCourses.map((c: any) => {
        const enrollment = enrollments.find((e: any) => e.course_id === c.id)
        return {
          ...c,
          progress: enrollment ? enrollment.progress : 0,
          completed: enrollment ? enrollment.completed : false
        }
      })
      
      setCourses(merged)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="container max-w-5xl py-8 mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Learning Hub</h1>
        <p className="text-muted-foreground mt-2">Master the skills needed to build and scale your startup.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">Loading courses...</div>
        ) : courses.map(course => (
          <Card key={course.id} className="flex flex-col overflow-hidden border-border hover:shadow-md transition-all">
            <div className="aspect-video bg-muted relative flex items-center justify-center">
              <PlayCircle className="h-12 w-12 text-muted-foreground/40" />
              <div className="absolute top-2 right-2 bg-background/90 backdrop-blur text-xs px-2 py-1 rounded-md font-medium">
                {course.category}
              </div>
            </div>
            
            <CardHeader className="flex-1 pb-2">
              <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2">{course.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="pb-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  {course.instructor}
                </div>
              </div>
              
              {course.progress > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{course.progress === 100 ? 'Completed' : 'In Progress'}</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${course.progress === 100 ? 'bg-green-500' : 'bg-primary'}`} 
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="pt-0">
              {course.progress === 100 ? (
                <Button className="w-full bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50 hover:bg-green-100 dark:hover:bg-green-900/40" variant="outline">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Download Certificate
                </Button>
              ) : course.progress > 0 ? (
                <Button className="w-full">Continue Learning</Button>
              ) : (
                <Button variant="outline" className="w-full">Start Course</Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
