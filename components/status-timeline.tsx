import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { STARTUP_STATUS_FLOW, type StartupStatus } from "@/lib/mock-data"

// Simplified linear pipeline (drops the branch "Needs Improvement" for the stepper).
const PIPELINE: StartupStatus[] = [
  "Draft",
  "Submitted",
  "Under Review",
  "Approved",
  "Incubation Ready",
]

export function StatusTimeline({ current }: { current: StartupStatus }) {
  // "Needs Improvement" maps back to the "Under Review" position visually.
  const normalized: StartupStatus = current === "Needs Improvement" ? "Under Review" : current
  const currentIndex = PIPELINE.indexOf(normalized)
  const flaggedForChanges = current === "Needs Improvement"

  return (
    <ol className="flex flex-col gap-0">
      {PIPELINE.map((status, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        const isLast = i === PIPELINE.length - 1
        return (
          <li key={status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                  done && "border-primary bg-primary text-primary-foreground",
                  active &&
                    (flaggedForChanges
                      ? "border-warning bg-warning text-warning-foreground"
                      : "border-primary bg-primary/10 text-primary"),
                  !done && !active && "border-border bg-muted text-muted-foreground",
                )}
              >
                {done ? <CheckIcon className="size-3.5" /> : i + 1}
              </span>
              {!isLast && (
                <span
                  className={cn(
                    "my-1 w-px flex-1 min-h-6",
                    done ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
            <div className={cn("pb-6", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  !done && !active && "text-muted-foreground",
                )}
              >
                {active && flaggedForChanges ? "Needs Improvement" : status}
              </p>
              <p className="text-xs text-muted-foreground">
                {statusHint(status, done, active)}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function statusHint(status: StartupStatus, done: boolean, active: boolean) {
  if (done) return "Completed"
  if (active) return "In progress"
  const hints: Record<string, string> = {
    Draft: "Save your application",
    Submitted: "Send for review",
    "Under Review": "Reviewer evaluates",
    Approved: "Decision published",
    "Incubation Ready": "Join the program",
  }
  return hints[status] ?? "Pending"
}

export { STARTUP_STATUS_FLOW }
