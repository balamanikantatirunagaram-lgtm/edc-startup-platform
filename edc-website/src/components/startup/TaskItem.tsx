"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Task {
  id: string
  title: string
  description?: string | null
  status: string
  assigned_to: string
}

interface TaskItemProps {
  task: Task
  assigneeName?: string
  onStatusChange: (taskId: string, status: string) => void
}

const STATUS_STYLES: Record<string, string> = {
  pending: "border-amber-500/30 bg-amber-500/5",
  in_progress: "border-blue-500/30 bg-blue-500/5",
  completed: "border-green-500/30 bg-green-500/5",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
}

export function TaskItem({ task, assigneeName, onStatusChange }: TaskItemProps) {
  const initials = (assigneeName || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl border p-4 transition-all hover:shadow-sm ${STATUS_STYLES[task.status] || ""}`}>
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-8 border">
          <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className={`truncate text-sm font-semibold ${task.status === 'completed' ? "text-muted-foreground line-through" : ""}`}>
            {task.title}
          </p>
          <p className="text-xs text-muted-foreground">
            Assigned to <span className="font-medium text-foreground/80">{assigneeName || "Unknown"}</span>
          </p>
        </div>
      </div>
      <Select value={task.status} onValueChange={(val) => val && onStatusChange(task.id, val)}>
        <SelectTrigger size="sm" className="w-[130px] shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
