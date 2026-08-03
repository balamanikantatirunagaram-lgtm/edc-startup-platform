import { cn } from "@/lib/utils"
import type { StartupStatus } from "@/store/mock-data"

const styles: Record<StartupStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  Submitted: "bg-accent text-accent-foreground",
  "Under Review": "bg-accent text-accent-foreground",
  "Needs Improvement": "bg-warning/15 text-warning-foreground dark:text-warning",
  Approved: "bg-success/15 text-success dark:text-success",
  "Incubation Ready": "bg-primary/12 text-primary",
}

const dot: Record<StartupStatus, string> = {
  Draft: "bg-muted-foreground",
  Submitted: "bg-primary",
  "Under Review": "bg-primary",
  "Needs Improvement": "bg-warning",
  Approved: "bg-success",
  "Incubation Ready": "bg-primary",
}

export function StatusBadge({
  status,
  className,
}: {
  status: StartupStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        styles[status],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot[status])} />
      {status}
    </span>
  )
}
