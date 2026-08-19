"use client"

import { chatWithAI } from "@/services/ai.service"
import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getAiPrompts } from "@/services/ai.service"
import { SendIcon, SparklesIcon, Trash2Icon } from "lucide-react"

export default function AiAssistantPage() {
  const [prompts, setPrompts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState("")
  const [chat, setChat] = React.useState<{role: string, content: string}[]>([])

  React.useEffect(() => {
    async function fetchPrompts() {
      const { prompts: data } = await getAiPrompts()
      setPrompts(data || [])
      setLoading(false)
    }
    fetchPrompts()
    
    // Load history
    const saved = localStorage.getItem("ai_chat_history")
    if (saved) {
      try {
        setChat(JSON.parse(saved))
      } catch(e) {}
    }
  }, [])

  const handleSend = async (text: string) => {
    if (!text.trim()) return
    const newChat = [...chat, { role: "user", content: text }];
    setChat(newChat);
    localStorage.setItem("ai_chat_history", JSON.stringify(newChat))
    setQuery("");
    
    // Call real AI backend
    const res = await chatWithAI(newChat);
    
    const updatedChat = [...newChat, {
      role: "ai",
      content: res.content || "Sorry, I encountered an error. Please try again later.",
    }];
    setChat(updatedChat);
    localStorage.setItem("ai_chat_history", JSON.stringify(updatedChat))
  }

  const clearHistory = () => {
    setChat([])
    localStorage.removeItem("ai_chat_history")
  }

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)] p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground">
            Ask questions, get feedback on your pitch, or brainstorm ideas.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={clearHistory}>
          <Trash2Icon className="size-4 mr-2" /> Clear History
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full flex-1 min-h-0">
        <div className="md:col-span-1 overflow-y-auto flex flex-col gap-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <SparklesIcon className="size-5 text-primary" /> Prompt Library
          </h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading prompts...</p>
          ) : (
            prompts.map((prompt: any) => (
              <Card key={prompt.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setQuery(prompt.text || prompt.prompt_text)}>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm">{prompt.title || "Suggested Prompt"}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                  {prompt.text || prompt.prompt_text}
                </CardContent>
              </Card>
            ))
          )}
          {prompts.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground bg-muted p-4 rounded-md">No prompts found. You can type your own query!</p>
          )}
        </div>

        <div className="md:col-span-3 flex flex-col border rounded-xl bg-card overflow-hidden h-full">
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {chat.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Start a conversation by typing below or choosing a prompt.
              </div>
            ) : (
              chat.map((msg, i) => (
                <div key={i} className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-primary text-primary-foreground self-end' : 'bg-muted self-start'}`}>
                  {msg.content}
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t bg-background">
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); handleSend(query); }}>
              <Input 
                placeholder="Type your message..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <SendIcon className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
