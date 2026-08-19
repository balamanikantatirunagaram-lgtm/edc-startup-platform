"use client"

import * as React from "react"
import { Loader2, PlusIcon, Trash2Icon, TrophyIcon, SparklesIcon, PencilIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getGamificationPoints, awardPoints, getAIPrompts, createAIPrompt, updateAIPrompt, deleteAIPrompt } from "@/services/gamification.service"

export default function AdminGamificationPage() {
  const [points, setPoints] = React.useState<any[]>([])
  const [prompts, setPrompts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  // Points state
  const [studentId, setStudentId] = React.useState("")
  const [pointsAmount, setPointsAmount] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [isPointsOpen, setIsPointsOpen] = React.useState(false)

  // AI Prompt state
  const [promptTitle, setPromptTitle] = React.useState("")
  const [promptContent, setPromptContent] = React.useState("")
  const [promptContext, setPromptContext] = React.useState("")
  const [isPromptOpen, setIsPromptOpen] = React.useState(false)
  const [editingPromptId, setEditingPromptId] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    const [pts, prmpts] = await Promise.all([
      getGamificationPoints(),
      getAIPrompts()
    ])
    setPoints(pts)
    setPrompts(prmpts)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const handleAwardPoints = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await awardPoints({
        student_id: studentId,
        points: parseInt(pointsAmount, 10),
        reason
      })
      toast.success("Points awarded successfully")
      setIsPointsOpen(false)
      setStudentId("")
      setPointsAmount("")
      setReason("")
      load()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleSavePrompt = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        title: promptTitle,
        prompt_text: promptContent,
        system_context: promptContext
      }
      if (editingPromptId) {
        await updateAIPrompt(editingPromptId, payload)
        toast.success("Prompt updated")
      } else {
        await createAIPrompt(payload)
        toast.success("Prompt created")
      }
      setIsPromptOpen(false)
      setPromptTitle("")
      setPromptContent("")
      setPromptContext("")
      setEditingPromptId(null)
      load()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleEditPrompt = (p: any) => {
    setPromptTitle(p.title || "")
    setPromptContent(p.prompt_text || "")
    setPromptContext(p.system_context || "")
    setEditingPromptId(p.id)
    setIsPromptOpen(true)
  }

  const handleDeletePrompt = async (id: string) => {
    if (!confirm("Delete this prompt?")) return
    try {
      await deleteAIPrompt(id)
      toast.success("Prompt deleted")
      load()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Gamification & AI</h1>
        <p className="text-sm text-muted-foreground">Manage student points and AI prompts.</p>
      </section>

      <Tabs defaultValue="points">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="points" className="gap-2">
            <TrophyIcon className="size-4" /> Points
          </TabsTrigger>
          <TabsTrigger value="prompts" className="gap-2">
            <SparklesIcon className="size-4" /> AI Prompts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="points" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base">Points History</CardTitle>
                <CardDescription>Recent points awarded to students.</CardDescription>
              </div>
              <Dialog open={isPointsOpen} onOpenChange={setIsPointsOpen}>
                <DialogTrigger render={<Button size="sm" className="gap-2" />}>
                  <PlusIcon className="size-4" /> Award Points
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleAwardPoints}>
                    <DialogHeader>
                      <DialogTitle>Award Points</DialogTitle>
                      <DialogDescription>Give a student points for their achievements.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input placeholder="Student ID (UUID)" value={studentId} onChange={e => setStudentId(e.target.value)} required />
                      <Input type="number" placeholder="Points" value={pointsAmount} onChange={e => setPointsAmount(e.target.value)} required />
                      <Input placeholder="Reason (e.g. Completed Phase 1)" value={reason} onChange={e => setReason(e.target.value)} required />
                    </div>
                    <DialogFooter>
                      <Button type="submit">Award Points</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-4">
              {loading ? (
                <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground size-6" /></div>
              ) : points.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground italic text-sm">No points awarded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                        <th className="p-4">Student</th>
                        <th className="p-4">Points</th>
                        <th className="p-4">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {points.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-4 font-medium">{item.student_id}</td>
                          <td className="p-4 font-bold text-green-600">+{item.points}</td>
                          <td className="p-4 text-muted-foreground">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base">AI Prompts</CardTitle>
                <CardDescription>Manage prompts used by AI assistants.</CardDescription>
              </div>
              <Dialog open={isPromptOpen} onOpenChange={(val) => {
                setIsPromptOpen(val)
                if(!val) { setPromptTitle(""); setPromptContent(""); setPromptContext(""); setEditingPromptId(null) }
              }}>
                <DialogTrigger render={<Button size="sm" className="gap-2" />}>
                  <PlusIcon className="size-4" /> Add Prompt
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleSavePrompt}>
                    <DialogHeader>
                      <DialogTitle>{editingPromptId ? "Edit" : "Add"} AI Prompt</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input placeholder="Title / Key" value={promptTitle} onChange={e => setPromptTitle(e.target.value)} required />
                      <Textarea placeholder="System Context" value={promptContext} onChange={e => setPromptContext(e.target.value)} />
                      <Textarea placeholder="Prompt Template" value={promptContent} onChange={e => setPromptContent(e.target.value)} required className="min-h-[100px]" />
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-4">
              {loading ? (
                <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground size-6" /></div>
              ) : prompts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground italic text-sm">No AI prompts found.</div>
              ) : (
                <div className="grid gap-4">
                  {prompts.map((item) => (
                    <div key={item.id} className="border rounded-md p-4 bg-muted/10">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{item.title}</h3>
                        <div className="space-x-2 flex">
                          <Button variant="ghost" size="sm" onClick={() => handleEditPrompt(item)}><PencilIcon className="size-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeletePrompt(item.id)}><Trash2Icon className="size-4" /></Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 font-mono bg-muted/50 p-2 rounded">{item.prompt_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
