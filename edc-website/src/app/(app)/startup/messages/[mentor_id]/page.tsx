"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { getMentorMessages, sendMentorMessage, markMentorMessagesRead } from "@/services/messages.service"
import { getMyMentorshipRequests, getMentorFeedback } from "@/services/mentorship.service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendIcon, ArrowLeftIcon, Loader2Icon, MessageSquareIcon, FileTextIcon, CheckCheckIcon } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@supabase/supabase-js"

export default function StudentMessagesPage() {
  const params = useParams()
  const router = useRouter()
  const mentorId = params.mentor_id as string

  const [messages, setMessages] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [newMessage, setNewMessage] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const [teamId, setTeamId] = React.useState<string | null>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const [connectionStatus, setConnectionStatus] = React.useState<string | null>(null)
  const [feedback, setFeedback] = React.useState<{ stageName: string; text: string; date: string }[]>([])

  React.useEffect(() => {
    loadMessages()
  }, [mentorId])

  // Connection state + mentor feedback (for gating & Feedback tab)
  React.useEffect(() => {
    let active = true
    getMyMentorshipRequests().then((res: any) => {
      if (!active || !res.requests) return
      const mine = res.requests.find((r: any) => r.mentor_id === mentorId)
      if (mine) setConnectionStatus(mine.status)
      else setConnectionStatus(null)
    }).catch(() => {})
    getMentorFeedback().then(res => {
      if (!active || !res.feedback) return
      setFeedback(res.feedback)
    }).catch(() => {})
    return () => { active = false }
  }, [mentorId])

  // Mark incoming messages read whenever thread loads/updates
  React.useEffect(() => {
    if (messages.length > 0) markMentorMessagesRead(mentorId).catch(() => {})
  }, [messages, mentorId])

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  React.useEffect(() => {
    if (!teamId) return

    // Setup Supabase Realtime subscription
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    
    if (!supabaseUrl || !supabaseKey) return

    const supabase = createClient(supabaseUrl, supabaseKey)

    const channel = supabase.channel('mentor_messages_channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'mentor_messages',
        filter: `team_id=eq.${teamId}`
      }, (payload) => {
        // Fetch full message or just append basic details (we will reload to get enriched names for now)
        loadMessages()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [teamId])

  const loadMessages = async () => {
    const res = await getMentorMessages(mentorId)
    if (res.success) {
      setMessages(res.messages)
      if (res.teamId) setTeamId(res.teamId)
    } else {
      toast.error(res.error || "Failed to load messages")
    }
    setLoading(false)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    const res = await sendMentorMessage(mentorId, newMessage)
    if (res.success) {
      setNewMessage("")
      loadMessages()
    } else {
      toast.error(res.error || "Failed to send message")
    }
    setSending(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2Icon className="animate-spin text-muted-foreground size-8" />
      </div>
    )
  }

  if (connectionStatus === 'declined') {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-10 text-center">
        <Button variant="ghost" onClick={() => router.push('/mentors')} className="pl-0 gap-2 mb-4">
          <ArrowLeftIcon className="size-4" /> Back to Mentors
        </Button>
        <Card>
          <CardContent className="py-10 space-y-2">
            <p className="font-semibold">This connection was declined</p>
            <p className="text-sm text-muted-foreground">You can send a new mentorship request from the Mentor Connect page at any time.</p>
            <Button onClick={() => router.push('/mentors')} className="mt-3">Browse Mentors</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => router.push('/startup')} className="pl-0 gap-2">
          <ArrowLeftIcon className="size-4" /> Back to Dashboard
        </Button>
        {connectionStatus === 'accepted' && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
            <CheckCheckIcon className="size-3.5" /> Connected
          </span>
        )}
      </div>

      <Tabs defaultValue="messages" className="flex flex-col flex-1 min-h-0">
        <TabsList className="self-start rounded-full p-1">
          <TabsTrigger value="messages" className="rounded-full px-4 gap-1.5"><MessageSquareIcon className="size-4" /> Messages</TabsTrigger>
          <TabsTrigger value="feedback" className="rounded-full px-4 gap-1.5"><FileTextIcon className="size-4" /> Mentor Feedback{feedback.length > 0 ? ` (${feedback.length})` : ''}</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="flex flex-col flex-1 min-h-0">
        <Card className="flex flex-col flex-1 overflow-hidden shadow-sm border">
        <CardHeader className="bg-muted/30 border-b py-4">
          <CardTitle className="text-lg">Chat with Mentor</CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-sm h-full">
              <p>No messages yet.</p>
              <p>Send a message to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              // Simple heuristic to check if it's sent by a student or mentor
              // If senderName is not "Unknown Mentor" we'll assume it's me/my team
              const isMine = msg.sender_id !== mentorId 
              
              return (
                <div key={msg.id || i} className={`flex flex-col max-w-[80%] ${isMine ? 'self-end' : 'self-start'}`}>
                  <span className={`text-[10px] text-muted-foreground mb-1 ${isMine ? 'text-right mr-1' : 'ml-1'}`}>
                    {msg.senderName} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className={`p-3 text-sm rounded-2xl ${
                    isMine 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-muted text-foreground rounded-tl-sm border'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-4 bg-background border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2 relative">
            <Input 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..." 
              className="flex-1 pr-12 rounded-full"
              disabled={sending}
            />
            <Button type="submit" size="icon" disabled={sending || !newMessage.trim()} className="absolute right-1 top-1 bottom-1 h-auto rounded-full bg-primary hover:bg-primary/90">
              {sending ? <Loader2Icon className="size-4 animate-spin text-white" /> : <SendIcon className="size-4 text-white" />}
            </Button>
          </form>
        </div>
      </Card>
      </TabsContent>

      <TabsContent value="feedback" className="flex-1 overflow-y-auto">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Mentor Feedback</CardTitle>
            <p className="text-sm text-muted-foreground">
              Review notes your mentor left on your startup's incubation journey.
            </p>
          </CardHeader>
          <CardContent>
            {feedback.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <FileTextIcon className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                No feedback yet. Your mentor leaves notes here as they review your milestones.
              </div>
            ) : (
              <ol className="relative space-y-5 border-l border-primary/25 ml-3">
                {feedback.map((f, i) => (
                  <li key={i} className="ml-6">
                    <span className="absolute -left-[7px] flex size-3.5 items-center justify-center rounded-full bg-primary shadow shadow-primary/30" />
                    <div className="rounded-xl border bg-card p-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{f.stageName}</span>
                        <span className="text-[11px] text-muted-foreground">{f.date}</span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{f.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>
    </div>
  )
}
