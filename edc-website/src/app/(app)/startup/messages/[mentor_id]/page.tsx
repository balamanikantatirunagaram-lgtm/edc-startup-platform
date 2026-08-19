"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { getMentorMessages, sendMentorMessage } from "@/services/messages.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendIcon, ArrowLeftIcon, Loader2Icon } from "lucide-react"
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

  React.useEffect(() => {
    loadMessages()
  }, [mentorId])

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

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => router.push('/startup')} className="pl-0 gap-2">
          <ArrowLeftIcon className="size-4" /> Back to Dashboard
        </Button>
      </div>

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
    </div>
  )
}
