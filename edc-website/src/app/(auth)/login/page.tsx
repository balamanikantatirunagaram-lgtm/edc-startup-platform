"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { login } from "@/services/auth.service"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { PasswordInput } from "@/components/shared/PasswordInput"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const data = new FormData(e.currentTarget)
    const niatId = String(data.get("niatId") ?? "")
    const password = String(data.get("password") ?? "")

    try {
      const res = await login(niatId, password)
      
      if (res.error) {
        toast.error(res.error)
        setLoading(false)
        return
      }

      if (res.isFirstLogin) {
        toast.info("First login — please set up a new password and security question.")
        router.push("/first-login")
      } else {
        toast.success(`Welcome back, ${res.name}.`)
        router.push("/dashboard")
      }
    } catch (err) {
      console.error("Client Catch Error:", err)
      toast.error(err instanceof Error ? `Fetch Error: ${err.message}` : "An unexpected error occurred. Check console.")
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-balance">
          Sign in to your account
        </h2>
        <p className="text-sm text-muted-foreground text-pretty">
          Use your NIAT ID and the password provided by the EDC team.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="niatId">NIAT ID</FieldLabel>
            <Input
              id="niatId"
              name="niatId"
              placeholder="e.g. N25H01A1298"
              autoComplete="username"
              required
            />
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput id="password" name="password" required />
            <FieldDescription>
              First time here? Enter your default password to set a new one.
            </FieldDescription>
          </Field>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </FieldGroup>
      </form>

      <div className="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-1 font-medium text-foreground hover:underline underline-offset-4">
          <ArrowLeft className="h-3 w-3" />
          Back to Home
        </Link>
        <p>
          Trouble signing in? Contact the EDC office at edc@niat.edu
        </p>
      </div>
    </div>
  )
}
