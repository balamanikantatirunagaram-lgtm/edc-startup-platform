"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Search, Loader2, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getAllStartupDocuments } from "@/services/documents.service"
import { toast } from "sonner"

export default function MentorDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const res = await getAllStartupDocuments()
    if (res.documents) setDocuments(res.documents)
    setLoading(false)
  }

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (doc.startups?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.doc_type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Startup Documents</h1>
          <p className="text-muted-foreground mt-1">Review pitch decks, business plans, and reports from startups.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search documents or startups..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-11"
          />
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <div className="divide-y divide-border">
          {loading ? (
            <div className="py-20 flex justify-center flex-col items-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              Loading documents...
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <FileText className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
              <p className="text-lg font-medium">No documents found</p>
              <p className="text-muted-foreground">Startups haven't uploaded any documents yet.</p>
            </div>
          ) : (
            filteredDocs.map(doc => (
              <div key={doc.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-muted/40 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base">{doc.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        {doc.startups?.name || "Unknown Startup"}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <Badge variant="secondary" className="font-normal">{doc.doc_type}</Badge>
                      <span className="text-muted-foreground hidden sm:inline">•</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" className="gap-2 shadow-sm" onClick={() => window.open(doc.file_url, '_blank')} title="Open Document">
                    <ArrowUpRight className="h-4 w-4" /> View
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
