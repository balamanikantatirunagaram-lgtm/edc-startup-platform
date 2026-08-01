import type { ReactNode } from "react"

import { Brand } from "@/components/layout/Brand"
import { ModeToggle } from "@/components/shared/ModeToggle"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Brand subtitle={false} className="[&_span]:text-primary-foreground" />
        <div className="max-w-md">
          <p className="font-serif text-4xl leading-tight tracking-tight text-balance">
            Turn your idea into a venture the campus backs.
          </p>
          <p className="mt-4 text-sm/relaxed text-primary-foreground/70">
            Register your startup, track it through review, and get the
            mentorship and support of the Entrepreneurship Development Cell.
          </p>
        </div>
        <div className="flex items-center gap-8 text-sm text-primary-foreground/70">
          <div>
            <p className="text-2xl font-semibold text-primary-foreground">
              120+
            </p>
            <p>Startups registered</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-primary-foreground">
              38
            </p>
            <p>Incubation ready</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-primary-foreground">
              ₹2.4Cr
            </p>
            <p>Funding facilitated</p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-col">
        <div className="flex items-center justify-between p-4 lg:hidden">
          <Brand />
          <ModeToggle />
        </div>
        <div className="absolute right-4 top-4 hidden lg:block">
          <ModeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}
