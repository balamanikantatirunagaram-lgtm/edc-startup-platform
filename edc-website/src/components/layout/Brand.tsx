import { cn } from "@/lib/utils"

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-4.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 19c0-6 4-11 11-13-2 6-7 10-11 13Z" />
        <path d="M5 19c3 0 6-1 8-3" />
      </svg>
    </div>
  )
}

export function Brand({
  className,
  subtitle = true,
}: {
  className?: string
  subtitle?: boolean
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BrandMark />
      <div className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-tight">EDC Cell</span>
        {subtitle && (
          <span className="text-[11px] text-muted-foreground">
            Startup Platform
          </span>
        )}
      </div>
    </div>
  )
}
