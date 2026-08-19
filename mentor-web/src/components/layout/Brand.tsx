import { cn } from "@/lib/utils"

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg overflow-hidden",
        className,
      )}
      aria-hidden="true"
    >
      <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
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
