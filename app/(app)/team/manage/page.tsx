"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { getTeamRequests, handleTeamRequest, searchStudentsByNiat, inviteStudent } from "@/app/actions/team"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { CheckIcon, XIcon, Loader2Icon, SearchIcon, SendIcon } from "lucide-react"

export default function TeamManagePage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [teamId, setTeamId] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [inviting, setInviting] = useState<string | null>(null)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setLoading(true)
    const res = await getTeamRequests()
    if (res.requests) {
      setRequests(res.requests)
    }
    if (res.teamId) {
      setTeamId(res.teamId)
    }
    setLoading(false)
  }

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    toast.info(`Processing request...`)
    const res = await handleTeamRequest(id, status)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(`Request ${status} successfully!`)
      setRequests(prev => prev.filter(r => r.id !== id))
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setIsSearching(true)
    const res = await searchStudentsByNiat(searchQuery)
    setSearchResults(res.users || [])
    setIsSearching(false)
  }

  const handleInvite = async (studentNiat: string) => {
    if (!teamId) return
    setInviting(studentNiat)
    const res = await inviteStudent(studentNiat, teamId)
    setInviting(null)
    
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Invite sent successfully!")
      setSearchResults(prev => prev.filter(u => u.id !== studentNiat))
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-semibold tracking-tight">Manage Team</h1>
      <p className="text-sm text-muted-foreground">
        Review pending requests or invite new students to join your startup team.
      </p>

      {teamId && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Invite Members</CardTitle>
            <CardDescription>Search for students by Name or NIAT ID to send an invite.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Enter Name or NIAT ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" disabled={isSearching}>
                {isSearching ? <Loader2Icon className="size-4 animate-spin" /> : <SearchIcon className="size-4" />}
                <span className="sr-only">Search</span>
              </Button>
            </form>
            
            {searchResults.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                <span className="text-sm font-medium text-muted-foreground">Search Results</span>
                {searchResults.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.id}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleInvite(user.id)}
                      disabled={inviting === user.id}
                    >
                      {inviting === user.id ? <Loader2Icon className="size-4 animate-spin" /> : <SendIcon className="size-4 mr-2" />}
                      Invite
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pending Join Requests</CardTitle>
          <CardDescription>Approve or deny students who have scanned your QR code or entered your invite code.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2Icon className="animate-spin size-8 text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No pending requests.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {requests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-4 rounded-xl border bg-card">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{req.studentName}</span>
                    <span className="text-xs text-muted-foreground">Requested on {new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" onClick={() => handleAction(req.id, 'rejected')}>
                      <XIcon className="size-4" />
                    </Button>
                    <Button variant="default" size="icon" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(req.id, 'approved')}>
                      <CheckIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={loadRequests}>Refresh List</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
