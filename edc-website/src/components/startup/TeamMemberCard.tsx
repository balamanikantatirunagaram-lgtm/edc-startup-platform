"use client"

import { CrownIcon, Loader2Icon, UserMinusIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface TeamMemberCardProps {
  id: string
  name: string
  role: string
  niatId?: string
  isLeaderViewing: boolean
  removing: boolean
  onRemove: (id: string) => void
}

export function TeamMemberCard({ id, name, role, niatId, isLeaderViewing, removing, onRemove }: TeamMemberCardProps) {
  const isLeader = role === 'Team Leader'
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="group flex items-center justify-between gap-3 rounded-xl border bg-card p-3.5 transition-colors hover:border-primary/30 hover:bg-muted/20">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative">
          <Avatar className="size-10 border">
            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">{initials}</AvatarFallback>
          </Avatar>
          {isLeader && (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-amber-400 text-white shadow-sm">
              <CrownIcon className="size-2.5" />
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{name}</p>
          <div className="flex items-center gap-1.5">
            <Badge variant={isLeader ? "default" : "secondary"} className="text-[10px]">{role}</Badge>
            {niatId && <span className="font-mono text-[10px] text-muted-foreground">{niatId}</span>}
          </div>
        </div>
      </div>
      {isLeaderViewing && !isLeader && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
          disabled={removing}
          onClick={() => onRemove(id)}
        >
          {removing ? <Loader2Icon className="size-4 animate-spin" /> : <UserMinusIcon className="size-4" />}
        </Button>
      )}
    </div>
  )
}
