"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { MessageCircleIcon, XIcon, SendIcon, Loader2Icon, BotIcon, UserIcon, SparklesIcon } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm **EDC AI**, your startup assistant 🚀\n\nI know your team, startup details, tasks, and everything about this platform. Ask me anything!"
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { role: "user", content: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.reply || data.error || "Something went wrong."
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Connection error. Please try again."
      }])
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const renderContent = (text: string) => {
    // Simple markdown: bold
    return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 size-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
        aria-label="Open EDC AI Chat"
      >
        {open
          ? <XIcon className="size-6" />
          : <img src="/chatbot.png" alt="ChatBot" className="size-full object-cover rounded-full" />
        }
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[600px] flex flex-col rounded-2xl border border-border/60 bg-background shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground">
            <div className="size-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              <img src="/chatbot.png" alt="ChatBot" className="size-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">EDC AI</span>
              <span className="text-xs text-white/70">Powered by Nemotron Ultra</span>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <span className="size-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/70">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20" style={{ maxHeight: "420px" }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`size-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary text-primary-foreground"
                }`}>
                  {msg.role === "user"
                    ? <UserIcon className="size-3.5" />
                    : <img src="/chatbot.png" alt="ChatBot" className="size-full object-cover" />
                  }
                </div>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-background border border-border/50 text-foreground rounded-tl-sm shadow-sm"
                }`}>
                  {renderContent(msg.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center overflow-hidden">
                  <img src="/chatbot.png" alt="ChatBot" className="size-full object-cover" />
                </div>
                <div className="bg-background border border-border/50 rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                  <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-background flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your startup..."
              disabled={loading}
              className="flex-1 text-sm bg-muted/40 rounded-xl px-3 py-2 border border-border/50 outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-all disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <SendIcon className="size-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
