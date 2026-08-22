"use client"

import * as React from "react"
import { CheckIcon, CopyIcon, RocketIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"

interface StartupHeroProps {
  name: string
  tagline?: string | null
  status?: string
  industry?: string
  stage?: string
  teamCode: string
  teamSize: number
}

export function StartupHero({ name, tagline, status, industry, stage, teamCode, teamSize }: StartupHeroProps) {
  const [copied, setCopied] = React.useState(false)

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(teamCode)
      setCopied(true)
      toast.success("Team code copied!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy code")
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 sm:p-8">
      <div className="pointer-events-none absolute -top-24 right-0 size-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
        <Avatar className="size-16 border-2 border-primary/20 shadow-lg shadow-primary/10 sm:size-20">
          <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary to-primary/70 text-2xl font-extrabold text-primary-foreground">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={status === 'approved' ? 'default' : 'secondary'} className="capitalize">
              {status || 'Active'}
            </Badge>
            {industry && <Badge variant="outline">{industry}</Badge>}
            {stage && <Badge variant="outline">{stage}</Badge>}
          </div>
          <div>
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{name}</h1>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground sm:text-base">
              {tagline || "No tagline set yet."}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Team Code</span>
          <Button
            variant="outline"
            onClick={copyCode}
            className="gap-2 font-mono text-lg font-bold tracking-[0.3em] text-primary"
            size="lg"
          >
            {teamCode}
            {copied ? <CheckIcon className="size-4 text-green-600" /> : <CopyIcon className="size-4 opacity-60" />}
          </Button>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <RocketIcon className="size-3.5" />
            {teamSize} member{teamSize === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  )
}
