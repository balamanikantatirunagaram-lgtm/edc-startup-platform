"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { setupFirstLogin } from "@/app/actions/auth"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { PasswordInput } from "@/components/password-input"

export default function FirstLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const data = new FormData(e.currentTarget)
    
    const question = String(data.get("question") ?? "")
    const answer = String(data.get("answer") ?? "")
    const password = String(data.get("password") ?? "")
    const confirm = String(data.get("confirmPassword") ?? "")

    if (password !== confirm) {
      toast.error("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const res = await setupFirstLogin(question, answer, password)
      if (res.error) {
        toast.error(res.error)
        setLoading(false)
        return
      }
      
      toast.success("Security setup complete. Welcome!")
      router.push("/dashboard")
    } catch (err) {
      toast.error("An unexpected error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-balance">
          Welcome! Setup your account
        </h2>
        <p className="text-sm text-muted-foreground text-pretty">
          Since this is your first time logging in, you must change your password and set a security question.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="question">Security Question</FieldLabel>
            <div className="relative">
              <select
                id="question"
                name="question"
                required
                className="flex h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="" disabled selected hidden>Select a security question...</option>
                <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                <option value="What city were you born in?">What city were you born in?</option>
                <option value="What is your favorite book?">What is your favorite book?</option>
                <option value="What was the make of your first car?">What was the make of your first car?</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </Field>
          
          <Field>
            <FieldLabel htmlFor="answer">Security Answer</FieldLabel>
            <Input
              id="answer"
              name="answer"
              placeholder="Your answer"
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">New Password</FieldLabel>
            <PasswordInput id="password" name="password" required minLength={6} />
          </Field>
          
          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
            <PasswordInput id="confirmPassword" name="confirmPassword" required minLength={6} />
          </Field>
          
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Saving…" : "Save & Continue"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  )
}
