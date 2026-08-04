"use client"

import * as React from "react"
import Link from "next/link"
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
  FieldDescription,
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

      // Update the mock state's localStorage so the dashboard shows the real name
      localStorage.setItem('edc_user', JSON.stringify({
        id: "u_mentor_logged_in",
        fullName: res.name,
        username: username,
        role: "mentor",
        email: `${username.toLowerCase()}@mentor.com`,
        active: true,
        passwordChanged: true,
        profileCompletion: 100
      }));

      if (res.isFirstLogin) {
        toast.info("First login — please set up a new password and security question.")
        router.push("/first-login")
      } else {
        toast.success(`Welcome back, ${res.name}.`)
        router.push("/dashboard")
      }
    } catch (err) {
      console.error("Client Catch Error:", err)
      toast.error("An unexpected error occurred.")
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
          Use the username and password provided by the administrator.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              name="username"
              placeholder="e.g. johndoe"
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
          <Field orientation="horizontal">
            <Checkbox id="remember" name="remember" />
            <FieldLabel htmlFor="remember" className="font-normal">
              Keep me signed in for 30 days
            </FieldLabel>
          </Field>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Trouble signing in? Contact the EDC office at edc@niat.edu
      </p>
    </div>
  )
}
