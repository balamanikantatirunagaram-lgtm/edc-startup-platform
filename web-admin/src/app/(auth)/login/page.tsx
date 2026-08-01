"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { login } from "@/services/auth.service"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { PasswordInput } from "@/components/shared/PasswordInput"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const data = new FormData(e.currentTarget)
    const username = String(data.get("username") ?? "")
    const password = String(data.get("password") ?? "")

    try {
      const res = await login(username, password)
      
      if (res.error) {
        toast.error(res.error)
        setLoading(false)
        return
      }

      toast.success(`Welcome back, ${res.name}.`)
      router.push("/admin")
    } catch (err) {
      toast.error("An unexpected error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-balance">
          EDC Admin Portal
        </h2>
        <p className="text-sm text-muted-foreground text-pretty">
          Sign in securely to manage students, startups, and events.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              name="username"
              placeholder="e.g. EdcAdmin"
              autoComplete="username"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput id="password" name="password" required />
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="remember" name="remember" />
            <FieldLabel htmlFor="remember" className="font-normal">
              Keep me signed in for 30 days
            </FieldLabel>
          </Field>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Authenticating…" : "Sign In"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  )
}
