"use client"

import * as React from "react"
import Link from "next/link"
import { SearchIcon, PlusIcon, RocketIcon } from "lucide-react"

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
import { StatusBadge } from "@/components/status-badge"
import { STARTUP_CATEGORIES, adminStartups } from "@/lib/mock-data"

export default function AdminStartupsPage() {
  const [search, setSearch] = React.useState("")
  const [catFilter, setCatFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")

  const filteredStartups = adminStartups.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.founder.toLowerCase().includes(search.toLowerCase())

    const matchesCat = catFilter === "all" || s.category === catFilter
    const matchesStatus = statusFilter === "all" || s.status === statusFilter

    return matchesSearch && matchesCat && matchesStatus
  })

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Startup Applications</h1>
          <p className="text-sm text-muted-foreground">Manage and review all campus startup applications.</p>
        </div>
      </section>

      {/* Filter toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by startup or founder name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {STARTUP_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
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
                  <CardDescription className="text-xs truncate">{s.tagline}</CardDescription>
                </div>
                <div className="scale-90 origin-right shrink-0">
                  <StatusBadge status={s.status} />
                </div>
              </CardHeader>
              <CardContent className="pb-4 pt-0 flex-1 flex flex-col justify-between gap-4">
                <div className="grid grid-cols-2 gap-2 text-xs border-y py-2.5 border-border/60">
                  <div>
                    <span className="text-muted-foreground block">Category</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{s.category}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Stage</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{s.stage}</span>
                  </div>
                  <div className="col-span-2 mt-1">
                    <span className="text-muted-foreground block">Founder</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{s.founder}</span>
                  </div>
                </div>
                <Button render={<Link href={`/admin/startups/${s.id}`} />} nativeButton={false} size="sm" className="w-full mt-2">
                  Review Application
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
