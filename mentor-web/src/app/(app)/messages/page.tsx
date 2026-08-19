"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendIcon, SearchIcon, Loader2Icon } from "lucide-react"
import { getConversations, getTeamMessages, sendTeamMessage } from "@/services/messages.service"
import { toast } from "sonner"
import { createClient } from "@supabase/supabase-js"

export default function MessagesPage() {
  const [conversations, setConversations] = React.useState<any[]>([])
  const [activeTeamId, setActiveTeamId] = React.useState<string | null>(null)
  const [messages, setMessages] = React.useState<any[]>([])
  const [loadingConv, setLoadingConv] = React.useState(true)
  const [loadingMsgs, setLoadingMsgs] = React.useState(false)
  const [newMessage, setNewMessage] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    loadConversations()
  }, [])

  React.useEffect(() => {
    if (activeTeamId) {
      loadMessages(activeTeamId)
    }
  }, [activeTeamId])

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Setup Supabase Realtime
  React.useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    
    if (!supabaseUrl || !supabaseKey) return

    const supabase = createClient(supabaseUrl, supabaseKey)

    const channel = supabase.channel('mentor_messages_channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'mentor_messages',
      }, (payload) => {
        // If message belongs to active team, reload messages
        if (payload.new.team_id === activeTeamId && activeTeamId) {
          loadMessages(activeTeamId)
        }
        // Always reload conversations to update snippets/unread counts
        loadConversations()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeTeamId])

  const loadConversations = async () => {
    const res = await getConversations()
    if (res.success) {
      setConversations(res.conversations)
      // Auto-select first if none selected
      if (!activeTeamId && res.conversations.length > 0) {
        setActiveTeamId(res.conversations[0].teamId)
      }
    }
    setLoadingConv(false)
  }

  const loadMessages = async (teamId: string) => {
    setLoadingMsgs(true)
    const res = await getTeamMessages(teamId)
    if (res.success) {
      setMessages(res.messages)
    } else {
      toast.error(res.error || "Failed to load messages")
    }
    setLoadingMsgs(false)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || !activeTeamId) return

    setSending(true)
    const res = await sendTeamMessage(activeTeamId, newMessage)
    if (res.success) {
      setNewMessage("")
      loadMessages(activeTeamId)
      loadConversations() // update snippet
    } else {
      toast.error(res.error || "Failed to send message")
    }
    setSending(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const activeConv = conversations.find(c => c.teamId === activeTeamId)

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">Communicate directly with your mentored startups.</p>
      </section>

      <Card className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 border-r flex flex-col bg-muted/10">
          <div className="p-4 border-b">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search startups..." className="pl-8 bg-background" />
            </div>
          </div>
          <div className="flex-1 overflow-auto flex flex-col">
            {loadingConv ? (
              <div className="p-8 text-center text-muted-foreground"><Loader2Icon className="animate-spin size-6 mx-auto" /></div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No active startups yet.</div>
            ) : (
              conversations.map(conv => (
                <button 
                  key={conv.teamId} 
                  onClick={() => setActiveTeamId(conv.teamId)}
                  className={`p-4 text-left border-b hover:bg-accent transition-colors ${activeTeamId === conv.teamId ? 'bg-accent' : ''}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm flex items-center gap-2">
                      {conv.teamName}
                      {conv.unreadCount > 0 && activeTeamId !== conv.teamId && (
                        <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">{conv.unreadCount}</span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">{conv.time}</span>
                  </div>
                  <p className={`text-xs truncate ${conv.unreadCount > 0 && activeTeamId !== conv.teamId ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{conv.lastMessage}</p>
                </button>
              ))
            )}
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeTeamId ? (
            <>
              <div className="p-4 border-b flex justify-between items-center bg-muted/10">
                <span className="font-semibold">{activeConv?.teamName}</span>
                <Button variant="outline" size="sm" onClick={() => window.location.href = `/startups/${activeTeamId}`}>View Profile</Button>
              </div>
              <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
                {loadingMsgs ? (
                  <div className="flex-1 flex justify-center items-center"><Loader2Icon className="animate-spin text-muted-foreground" /></div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex justify-center items-center text-sm text-muted-foreground">Start the conversation...</div>
                ) : (
                  messages.map((msg, i) => {
                    const isMine = msg.senderName === 'You'
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
              </div>
              <div className="p-4 border-t bg-background">
                <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                  <Input 
                    placeholder="Type your message..." 
                    className="flex-1 pr-12 rounded-full" 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    disabled={sending}
                  />
                  <Button type="submit" size="icon" disabled={sending || !newMessage.trim()} className="absolute right-1 top-1 bottom-1 h-auto rounded-full bg-primary hover:bg-primary/90">
                    {sending ? <Loader2Icon className="size-4 animate-spin text-white" /> : <SendIcon className="size-4 text-white" />}
                  </Button>
                </form>
              </div>
            </>
          ) : (
             <div className="flex-1 flex items-center justify-center text-muted-foreground">
               Select a conversation to start messaging
             </div>
          )}
        </div>
      </Card>
    </div>
  )
}
