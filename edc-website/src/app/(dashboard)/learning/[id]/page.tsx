"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeftIcon, PlayCircleIcon, CheckCircle2Icon, Loader2, BookOpenIcon, ClockIcon, UserIcon, ShieldAlertIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getCourseDetails, enrollInCourse, updateCourseProgress } from "@/services/learning.service"

export default function CoursePlayerPage({ params }: { params: { id: string } }) {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [enrolling, setEnrolling] = React.useState(false)
  
  // Player state
  const [activeModuleIndex, setActiveModuleIndex] = React.useState(0)

  React.useEffect(() => {
    async function load() {
      const res = await getCourseDetails(params.id)
      setData(res)
      setLoading(false)
    }
    load()
  }, [params.id])

  const handleEnroll = async () => {
    setEnrolling(true)
    const res = await enrollInCourse(params.id)
    setEnrolling(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Successfully enrolled! You can now track your progress.")
      // Reload to get enrollment data
      const updated = await getCourseDetails(params.id)
      setData(updated)
    }
  }

  const markModuleComplete = async () => {
    if (!data?.enrollment) return
    
    // Calculate new progress percentage
    const totalModules = data.course?.course_modules?.length || 1
    const currentProgress = data.enrollment.progress || 0
    
    // If they finish a module, add to progress. Simple logic: 100 / totalModules
    const step = 100 / totalModules
    const newProgress = Math.min(100, Math.round(currentProgress + step))
    const isCompleted = newProgress >= 100
    
    const res = await updateCourseProgress(params.id, newProgress, isCompleted)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Progress saved!")
      setData({
        ...data,
        enrollment: { ...data.enrollment, progress: newProgress, completed: isCompleted }
      })
      // Move to next module if available
      if (activeModuleIndex < totalModules - 1) {
        setActiveModuleIndex(activeModuleIndex + 1)
      }
    }
  }

  if (loading) {
    return <div className="flex p-20 justify-center"><Loader2 className="animate-spin text-muted-foreground size-8" /></div>
  }

  if (!data || !data.course) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center gap-4">
        <ShieldAlertIcon className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Course Not Found</h2>
        <Button asChild variant="outline"><Link href="/learning">Return to Learning Hub</Link></Button>
      </div>
    )
  }

  const course = data.course
  const enrollment = data.enrollment
  const modules = course.course_modules || []
  const activeModule = modules[activeModuleIndex]

  // Helper to render video player
  const renderVideoPlayer = (url: string) => {
    if (!url) return <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground"><PlayCircleIcon className="size-12 mb-2 opacity-50" /><p>No video attached</p></div>
    
    // If YouTube link
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let embedUrl = url
      if (url.includes('watch?v=')) embedUrl = url.replace('watch?v=', 'embed/')
      if (url.includes('youtu.be/')) embedUrl = url.replace('youtu.be/', 'youtube.com/embed/')
      return <iframe src={embedUrl} className="w-full h-full rounded-md border" allowFullScreen />
    }
    
    // Default standard video player for MP4
    return <video src={url} controls className="w-full h-full rounded-md bg-black" controlsList="nodownload" />
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 pb-10">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Link href="/learning" className="hover:text-primary hover:underline flex items-center gap-1">
          <ArrowLeftIcon className="size-3" /> Back to courses
        </Link>
        <span>/</span>
        <span className="truncate max-w-[200px]">{course.title}</span>
      </div>

      {!enrollment && (
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between p-6 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-primary">{course.title}</h2>
              <p className="text-muted-foreground mt-1 max-w-2xl">{course.description}</p>
              <div className="flex gap-4 mt-4 text-sm font-medium">
                <span className="flex items-center gap-1.5"><UserIcon className="size-4" /> {course.instructor}</span>
                <span className="flex items-center gap-1.5"><ClockIcon className="size-4" /> {course.duration}</span>
                <span className="flex items-center gap-1.5"><BookOpenIcon className="size-4" /> {modules.length} lessons</span>
              </div>
            </div>
            <Button size="lg" onClick={handleEnroll} disabled={enrolling} className="w-full sm:w-auto shrink-0 shadow-md">
              {enrolling ? <Loader2 className="animate-spin size-4 mr-2" /> : <PlayCircleIcon className="size-5 mr-2" />}
              Enroll & Start Learning
            </Button>
          </CardContent>
        </Card>
      )}

      {enrollment && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg border relative group">
              {modules.length > 0 ? renderVideoPlayer(activeModule?.video_url) : (
                 <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground flex-col">
                   <ShieldAlertIcon className="size-10 mb-2 opacity-50" />
                   <p>No modules have been added to this course yet.</p>
                 </div>
              )}
            </div>
            
            {activeModule && (
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">{activeModule.title}</h2>
                    <p className="text-muted-foreground mt-2 whitespace-pre-wrap">{activeModule.description || "No description provided for this lesson."}</p>
                  </div>
                  <Button onClick={markModuleComplete} variant="outline" className="shrink-0 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 dark:bg-green-900/20 dark:border-green-800/30 dark:text-green-400">
                    <CheckCircle2Icon className="mr-2 size-4" /> Mark Complete
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Playlist */}
          <div className="flex flex-col gap-4">
            <Card className="shadow-sm border">
              <CardContent className="p-5 flex flex-col gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{course.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Instructor: {course.instructor}</p>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Course Progress</span>
                    <span className={enrollment.progress === 100 ? "text-green-600" : "text-primary"}>{enrollment.progress || 0}%</span>
                  </div>
                  <Progress value={enrollment.progress || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 shadow-sm border overflow-hidden flex flex-col min-h-[300px]">
              <div className="p-4 border-b bg-muted/30 font-semibold flex items-center gap-2">
                <BookOpenIcon className="size-4 text-primary" /> Curriculum
              </div>
              <ScrollArea className="flex-1 h-full max-h-[400px] lg:max-h-[600px]">
                {modules.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">Empty curriculum</div>
                ) : (
                  <div className="flex flex-col divide-y">
                    {modules.map((mod: any, idx: number) => {
                      const isActive = activeModuleIndex === idx
                      return (
                        <button 
                          key={mod.id}
                          onClick={() => setActiveModuleIndex(idx)}
                          className={`flex items-start text-left gap-3 p-4 transition-colors hover:bg-muted/50 ${isActive ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'}`}
                        >
                          <div className={`size-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            {idx + 1}
                          </div>
                          <div className="flex flex-col gap-1 pr-2">
                            <span className={`text-sm font-medium leading-tight ${isActive ? 'text-primary' : ''}`}>
                              {mod.title}
                            </span>
                            <span className="text-xs text-muted-foreground line-clamp-1">{mod.description}</span>
                          </div>
                          <PlayCircleIcon className={`size-4 mt-0.5 ml-auto shrink-0 ${isActive ? 'text-primary opacity-100' : 'text-muted-foreground opacity-0 group-hover:opacity-50'}`} />
                        </button>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
