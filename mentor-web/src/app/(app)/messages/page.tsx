"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendIcon, SearchIcon } from "lucide-react"

export default function MessagesPage() {
  const conversations = [
    { id: 1, team: "EcoTrack", lastMessage: "Can we review the pitch deck tomorrow?", time: "10:30 AM", unread: true },
    { id: 2, team: "HealthAI", lastMessage: "Thanks for the feedback on our architecture!", time: "Yesterday", unread: false },
  ]

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
              <Input type="search" placeholder="Search conversations..." className="pl-8 bg-background" />
            </div>
          </div>
          <div className="flex-1 overflow-auto flex flex-col">
            {conversations.map(conv => (
              <button 
                key={conv.id} 
                className={`p-4 text-left border-b hover:bg-accent transition-colors ${conv.unread ? 'bg-accent/50' : ''}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm">{conv.team}</span>
                  <span className="text-xs text-muted-foreground">{conv.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-muted/10">
            <span className="font-semibold">EcoTrack</span>
            <Button variant="outline" size="sm">View Profile</Button>
          </div>
          <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
            <div className="flex justify-center">
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Today</span>
            </div>
            <div className="flex flex-col gap-1 max-w-[80%]">
              <span className="text-xs text-muted-foreground ml-1">EcoTrack Team</span>
              <div className="bg-muted p-3 rounded-2xl rounded-tl-sm text-sm">
                Hello! We've updated the pitch deck based on your feedback. Can we review it tomorrow morning?
              </div>
            </div>
          </div>
          <div className="p-4 border-t flex gap-2 bg-background">
            <Input placeholder="Type your message..." className="flex-1" />
            <Button size="icon"><SendIcon className="h-4 w-4" /></Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
