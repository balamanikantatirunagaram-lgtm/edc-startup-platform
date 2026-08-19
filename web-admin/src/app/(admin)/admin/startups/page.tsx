"use client"

import * as React from "react"
import Link from "next/link"
import { SearchIcon, RocketIcon, TrashIcon, AlertTriangleIcon, UsersIcon, UserIcon, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { getAllStartups, deleteStartupAdmin, getDuplicateTeamUsers } from "@/services/admin.service"
import { toast } from "sonner"

export default function AdminStartupsPage() {
  const [search, setSearch] = React.useState("")
  const [catFilter, setCatFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [startups, setStartups] = React.useState<any[]>([])
  const [duplicateUsers, setDuplicateUsers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [deleting, setDeleting] = React.useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    const [data, dupes] = await Promise.all([
      getAllStartups(),
      getDuplicateTeamUsers()
    ])
    setStartups(data)
    if (dupes.users) setDuplicateUsers(dupes.users)
    setLoading(false)
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (startupId: string, startupName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${startupName}" and its entire team? This action cannot be undone.`)) return
    setDeleting(startupId)
    const res = await deleteStartupAdmin(startupId)
    setDeleting(null)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(`"${startupName}" has been deleted.`)
      loadData()
    }
  }

  const filteredStartups = startups.filter((s) => {
    const matchesSearch =
      (s.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (s.teams?.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (s.leaderName?.toLowerCase() || "").includes(search.toLowerCase())

    const matchesCat = catFilter === "all" || s.industry === catFilter || s.category === catFilter
    const matchesStatus = statusFilter === "all" || (s.status || 'pending') === statusFilter

    return matchesSearch && matchesCat && matchesStatus
  })

  const categories = Array.from(new Set(startups.map(s => s.industry || s.category).filter(Boolean)))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Startup Applications</h1>
          <p className="text-sm text-muted-foreground">Manage and review all campus startup applications. <span className="font-medium text-foreground">{startups.length} total</span></p>
        </div>
      </section>

      {/* Duplicate Teams Warning */}
      {duplicateUsers.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangleIcon className="size-4" />
              Users with Multiple Teams ({duplicateUsers.length})
            </CardTitle>
            <CardDescription>These users lead more than one team. They should delete extra teams to keep one startup each.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {duplicateUsers.map((user: any) => (
              <div key={user.leaderId} className="p-3 rounded-lg border border-destructive/20 bg-background">
                <p className="font-medium text-sm">{user.leaderName} <span className="text-xs text-muted-foreground ml-1">{user.leaderEmail}</span></p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.teams.map((team: any) => (
                    <span key={team.id} className="text-xs bg-muted px-2 py-1 rounded-md border">
                      {team.name} {team.startup_id ? '' : '(no startup)'}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filter toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by startup, team, or leader name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Select value={catFilter} onValueChange={(v) => setCatFilter(v ?? '')}>
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c: any) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? '')}>
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">pending</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Incubation Ready">Incubation Ready</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Startups list */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStartups.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 text-center p-12 border rounded-xl bg-card text-muted-foreground text-sm italic">
            No startup applications found.
          </div>
        ) : (
          filteredStartups.map((s) => (
            <Card key={s.id} className="flex flex-col justify-between hover:shadow-md transition-all border-border/80">
              <CardHeader className="pb-3 flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <RocketIcon className="size-4 text-primary shrink-0" />
                    <CardTitle className="text-base font-semibold truncate">{s.name}</CardTitle>
                  </div>
                  <CardDescription className="text-xs truncate">{s.problem_statement?.substring(0, 50)}...</CardDescription>
                </div>
                <div className="scale-90 origin-right shrink-0">
                  <StatusBadge status={s.status || 'pending'} />
                </div>
              </CardHeader>
              <CardContent className="pb-4 pt-0 flex-1 flex flex-col justify-between gap-4">
                <div className="grid grid-cols-2 gap-2 text-xs border-y py-2.5 border-border/60">
                  <div>
                    <span className="text-muted-foreground block">Category</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{s.industry || s.category}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Stage</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{s.stage}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground flex items-center gap-1"><UserIcon className="size-3" /> Leader</span>
                    <span className="font-semibold text-foreground mt-0.5 block truncate">{s.leaderName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground flex items-center gap-1"><UsersIcon className="size-3" /> Team</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{s.teams?.name} ({s.memberCount})</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/admin/startups/${s.id}`}>
                      Review
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 border-destructive/20"
                    disabled={deleting === s.id}
                    onClick={() => handleDelete(s.id, s.name)}
                  >
                    {deleting === s.id ? <Loader2Icon className="size-4 animate-spin" /> : <TrashIcon className="size-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
