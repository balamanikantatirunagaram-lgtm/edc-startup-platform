"use client"

import { useEffect, useState } from "react"
import { getNetworkStartups, getBookmarks, toggleBookmark, requestMeeting } from "@/services/network.service"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Bookmark, BookmarkCheck, Calendar, Search } from "lucide-react"

export default function NetworkPage() {
  const [startups, setStartups] = useState<any[]>([])
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const resStartups = await getNetworkStartups()
      if (resStartups.startups) {
        setStartups(resStartups.startups)
      }
      const resBookmarks = await getBookmarks()
      if (resBookmarks.bookmarks) {
        setBookmarks(new Set(resBookmarks.bookmarks))
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const handleToggleBookmark = async (startupId: string) => {
    const isBookmarked = bookmarks.has(startupId)
    const newStatus = !isBookmarked
    
    // optimistic update
    const newBookmarks = new Set(bookmarks)
    if (newStatus) newBookmarks.add(startupId)
    else newBookmarks.delete(startupId)
    setBookmarks(newBookmarks)

    await toggleBookmark(startupId, newStatus)
  }

  const handleRequestMeeting = async (startupId: string) => {
    const topic = prompt("Enter meeting topic:")
    if (!topic) return
    const preferredTime = prompt("Enter preferred time (e.g. Next Monday 10AM):")
    if (!preferredTime) return

    const res = await requestMeeting(startupId, { topic, preferred_time: preferredTime })
    if (res.success) {
      alert("Meeting requested successfully!")
    } else {
      alert("Failed to request meeting: " + res.error)
    }
  }

  const filteredStartups = startups.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.tagline?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Network</h1>
        <p className="text-muted-foreground">Discover and connect with innovative startups.</p>
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search startups..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading startups...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStartups.map(startup => {
            const isBookmarked = bookmarks.has(startup.id)
            return (
              <Card key={startup.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{startup.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">{startup.tagline}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleToggleBookmark(startup.id)}>
                      {isBookmarked ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5 text-muted-foreground" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {startup.problem_statement}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{startup.status}</Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  {startup.website_url ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={startup.website_url} target="_blank" rel="noreferrer">Website</a>
                    </Button>
                  ) : <div />}
                  <Button size="sm" onClick={() => handleRequestMeeting(startup.id)}>
                    <Calendar className="mr-2 h-4 w-4" /> Request Meeting
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
          {filteredStartups.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-8">
              No startups found matching your criteria.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
