"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Trash2, Search, Loader2, ArrowUpRight, Plus, UploadCloud } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { getAllStartupDocuments, deleteDocument, uploadStartupDocument } from "@/services/documents.service"
import { getAllStartups } from "@/services/admin.service"
import { toast } from "sonner"

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [startups, setStartups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  const [uploadData, setUploadData] = useState<{
    startup_id: string,
    title: string,
    doc_type: string,
    file: File | null
  }>({
    startup_id: "",
    title: "",
    doc_type: "",
    file: null
  })

  useEffect(() => {
    load()
    loadStartups()
  }, [])

  async function load() {
    setLoading(true)
    const res = await getAllStartupDocuments()
    if (res.documents) setDocuments(res.documents)
    setLoading(false)
  }

  async function loadStartups() {
    const data = await getAllStartups()
    if (data) setStartups(data)
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to permanently delete this document?")) return
    
    const res = await deleteDocument(id)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Document removed")
      load()
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadData.startup_id || !uploadData.title || !uploadData.doc_type || !uploadData.file) {
      toast.error("Please fill all fields and select a file")
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('startup_id', uploadData.startup_id)
    formData.append('title', uploadData.title)
    formData.append('doc_type', uploadData.doc_type)
    formData.append('file', uploadData.file)

    const res = await uploadStartupDocument(formData)
    setIsUploading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Document uploaded successfully")
      setIsUploadOpen(false)
      setUploadData({ startup_id: "", title: "", doc_type: "", file: null })
      load()
    }
  }

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (doc.startups?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.doc_type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const docTypes = [
    "Pitch Deck",
    "Financial Projections",
    "Legal Document",
    "Cap Table",
    "Business Plan",
    "Technical Architecture",
    "Marketing Strategy",
    "Other"
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Repository</h1>
          <p className="text-muted-foreground mt-1">Global view of all startup pitch decks, financials, and legal files.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search documents or startups..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger render={<Button className="gap-2 h-10" />}>
              <UploadCloud className="size-4" /> Upload Document
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleUpload}>
                <DialogHeader>
                  <DialogTitle>Upload Startup Document</DialogTitle>
                  <DialogDescription>
                    Add a new file to a specific startup's repository.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Select Startup</label>
                    <Select value={uploadData.startup_id} onValueChange={v => setUploadData({...uploadData, startup_id: v ?? ""})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose startup..." />
                      </SelectTrigger>
                      <SelectContent>
                        {startups.map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Document Title</label>
                    <Input 
                      placeholder="e.g. Q3 Investor Update" 
                      value={uploadData.title}
                      onChange={e => setUploadData({...uploadData, title: e.target.value})}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Document Type</label>
                    <Select value={uploadData.doc_type} onValueChange={v => setUploadData({...uploadData, doc_type: v ?? ""})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {docTypes.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">File (PDF, PPT, DOCX)</label>
                    <Input 
                      type="file" 
                      required
                      onChange={e => {
                        if (e.target.files && e.target.files.length > 0) {
                          setUploadData({...uploadData, file: e.target.files[0]})
                        }
                      }}
                      className="cursor-pointer file:text-sm file:font-medium file:text-primary file:bg-primary/10 file:border-0 file:rounded-md file:px-2 file:py-1 hover:file:bg-primary/20"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isUploading}>
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upload File
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <div className="divide-y divide-border">
          {loading ? (
            <div className="py-20 flex justify-center flex-col items-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              Loading global documents...
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
                  <Button variant="ghost" size="icon" className="h-9 w-9 border border-border bg-background shadow-sm hover:bg-primary hover:text-primary-foreground" onClick={() => window.open(doc.file_url, '_blank')} title="Open Document">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 border border-border bg-background shadow-sm text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(doc.id)} title="Delete Document">
                    <Trash2 className="h-4 w-4" />
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
