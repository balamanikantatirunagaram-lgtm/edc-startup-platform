"use client"

import { CheckCircle2Icon, GraduationCapIcon, ListTodoIcon, UsersIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface StartupStatsProps {
  teamSize: number
  totalTasks: number
  doneTasks: number
  pendingRequests: number
  mentorCount: number
}

export function StartupStats({ teamSize, totalTasks, doneTasks, pendingRequests, mentorCount }: StartupStatsProps) {
  const taskPct = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100)

  const stats = [
    { label: "Team Size", value: teamSize, icon: UsersIcon, hint: "Members" },
    { label: "Tasks Done", value: `${doneTasks}/${totalTasks}`, icon: ListTodoIcon, hint: `${taskPct}% complete` },
    { label: "Join Requests", value: pendingRequests, icon: UsersIcon, hint: "Awaiting review" },
    { label: "Mentors", value: mentorCount, icon: GraduationCapIcon, hint: "Connected" },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col gap-1.5 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</span>
            <s.icon className="size-4 text-primary/70" />
          </div>
          <span className="text-2xl font-bold tabular-nums leading-none">{s.value}</span>
          <div className="mt-auto pt-1.5">
            {s.label === "Tasks Done" && totalTasks > 0 ? (
              <Progress value={taskPct} className="h-1.5" />
            ) : (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                {s.label === "Mentors" && Number(s.value) > 0 && <CheckCircle2Icon className="size-3 text-green-600" />}
                {s.hint}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
