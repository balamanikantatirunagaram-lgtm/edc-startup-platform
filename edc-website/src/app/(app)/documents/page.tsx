"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Plus, Trash2, Download, Search, FileSymlink, Presentation, Scale, CircleDollarSign, Shapes, Loader2, ArrowUpRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getStartupDocuments, addStartupDocument, deleteStartupDocument } from "@/services/startup.service"
import { toast } from "sonner"

const DOC_TYPES = [
  { value: "Pitch Deck", icon: Presentation, color: "text-foreground", bg: "bg-muted" },
  { value: "Legal", icon: Scale, color: "text-foreground", bg: "bg-muted" },
  { value: "Financial", icon: CircleDollarSign, color: "text-foreground", bg: "bg-muted" },
  { value: "BMC", icon: Shapes, color: "text-foreground", bg: "bg-muted" },
]

export default function DocumentCenterPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("All")

  // Form State
  const [title, setTitle] = useState("")
  const [docType, setDocType] = useState("Pitch Deck")
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const res = await getStartupDocuments()
    if (res.documents) setDocuments(res.documents)
    setLoading(false)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !file) {
      toast.error("Please provide both title and a file")
      return
    }
    
    setUploading(true)

    const formData = new FormData()
    formData.append("title", title)
    formData.append("docType", docType)
    formData.append("file", file)

    const res = await addStartupDocument(formData)
    setUploading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Document uploaded successfully")
      setUploadOpen(false)
      setTitle("")
      setFile(null)
      load()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this document?")) return
    const res = await deleteStartupDocument(id)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Document deleted")
      load()
    }
  }

  const filteredDocs = documents.filter(doc => {
    return activeTab === "All" || doc.doc_type === activeTab
  })

  return (
    <div className="container max-w-6xl py-10 mx-auto px-4 md:px-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-foreground">Document Center</h1>
          <p className="text-lg text-muted-foreground">
            Centralized, secure storage for your startup's most critical assets. Manage pitch decks, legal agreements, and financial models.
          </p>
        </div>
        
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger render={<Button size="lg" className="gap-2 shadow-md hover:shadow-lg transition-all active:scale-95" />}>
              <Upload className="h-4 w-4" /> Upload Document
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">New Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-6 py-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Document Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Q3 Investor Update" required className="h-12" />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Category</Label>
                <Select value={docType} onValueChange={(value) => setDocType(value ?? '')}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className={`h-4 w-4 ${type.color}`} />
                          {type.value}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold">File Upload</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 text-center hover:bg-muted/30 transition-colors cursor-pointer relative">
                  <Input 
                    type="file" 
                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)} 
                    required 
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                      <FileSymlink className="h-6 w-6" />
                    </div>
                    {file ? (
                      <p className="font-medium text-primary">{file.name}</p>
                    ) : (
                      <>
                        <p className="font-medium">Click to upload or drag and drop</p>
                        <p className="text-sm text-muted-foreground">PDF, DOCX, PNG up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setUploadOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={uploading} className="w-full sm:w-auto h-11">
                  {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : "Save Document"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-[600px]">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/20">
          <Tabs defaultValue="All" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="bg-transparent border border-border h-11 p-1">
              <TabsTrigger value="All" className="rounded-md px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">All Files</TabsTrigger>
              <TabsTrigger value="Pitch Deck" className="rounded-md px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Decks</TabsTrigger>
              <TabsTrigger value="Legal" className="rounded-md px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Legal</TabsTrigger>
              <TabsTrigger value="Financial" className="rounded-md px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Financial</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search documents..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-background h-11 rounded-full border-muted-foreground/30 focus-visible:ring-primary/50" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-0">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
              <p>Fetching your documents...</p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto">
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-primary/40" />
              </div>
              <h3 className="text-xl font-bold mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? "We couldn't find anything matching your search." : "You haven't uploaded any documents yet. Start building your data room."}
              </p>
              {!searchQuery && (
                <Button onClick={() => setUploadOpen(true)} variant="outline" className="rounded-full">
                  <Upload className="mr-2 h-4 w-4" /> Upload First Document
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredDocs.map((doc) => {
                const typeConfig = DOC_TYPES.find(t => t.value === doc.doc_type) || DOC_TYPES[0]
                const Icon = typeConfig.icon
                
                return (
                  <div key={doc.id} className="group flex items-center justify-between p-4 sm:p-6 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-5 overflow-hidden">
                      <div className={`shrink-0 p-3 rounded-xl ${typeConfig.bg} ${typeConfig.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                          {doc.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="secondary" className="text-xs font-medium rounded-md px-2 py-0.5 bg-background border border-border shadow-sm">
                            {doc.doc_type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-background border border-border hover:bg-primary hover:text-primary-foreground shadow-sm" onClick={() => window.open(doc.file_url, '_blank')} title="Open Document">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-background border border-border text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm" onClick={() => handleDelete(doc.id)} title="Delete Document">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
