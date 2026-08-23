import { cn } from "@/lib/utils"

// Accepts both legacy Title-Case and the lowercase/snake_case values written to
// startups.status by web-admin ('pending', 'under_review', 'needs_improvement',
// 'approved', 'incubation_ready') and NULL (shown as "Pending Review").
const normalize = (status: string): string => {
  const s = (status || "pending").trim().toLowerCase().replace(/\s+/g, "_")
  const map: Record<string, string> = {
    draft: "draft",
    pending: "pending",
    pending_review: "pending",
    submitted: "submitted",
    under_review: "under_review",
    needs_improvement: "needs_improvement",
    approved: "approved",
    incubation_ready: "incubation_ready",
  }
  return map[s] || "pending"
}

const styles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-muted text-muted-foreground",
  submitted: "bg-accent text-accent-foreground",
  under_review: "bg-accent text-accent-foreground",
  needs_improvement: "bg-warning/15 text-warning-foreground dark:text-warning",
  approved: "bg-success/15 text-success dark:text-success",
  incubation_ready: "bg-primary/12 text-primary",
}

const dot: Record<string, string> = {
  draft: "bg-muted-foreground",
  pending: "bg-muted-foreground",
  submitted: "bg-primary",
  under_review: "bg-primary",
  needs_improvement: "bg-warning",
  approved: "bg-success",
  incubation_ready: "bg-primary",
}

const label = (status: string) => {
  const s = normalize(status)
  return {
    draft: "Draft",
    pending: "Pending Review",
    submitted: "Submitted",
    under_review: "Under Review",
    needs_improvement: "Needs Improvement",
    approved: "Approved",
    incubation_ready: "Incubation Ready",
  }[s]
}

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const key = normalize(status)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        styles[key],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot[key])} />
      {label(status)}
    </span>
  )
}
