"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/shared/PasswordInput"
import { getSecurityQuestion, resetPasswordWithSecurityAnswer } from "@/services/auth.service"

const rules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /[0-9]/.test(v) },
]

export default function ResetPasswordPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchingQ, setFetchingQ] = useState(false)

  const allValid = rules.every((r) => r.test(password))
  const matches = password.length > 0 && password === confirm
  const canSubmit = username.trim() && answer.trim() && allValid && matches

  async function loadQuestion() {
    if (!username.trim() || fetchingQ) return
    setFetchingQ(true)
    const res = await getSecurityQuestion(username.trim())
    setFetchingQ(false)
    if (res.error || !res.question) {
      setQuestion("")
      toast.error(res.error || "Could not find your security question.")
    } else {
      setQuestion(res.question)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || loading) return
    setLoading(true)
    const res = await resetPasswordWithSecurityAnswer(username.trim(), answer.trim(), password)
    setLoading(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Password reset! Sign in with your new password.")
      router.push("/login")
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Set a new password</h1>
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          Verify your identity with your security question, then choose a strong password.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={loadQuestion}
              placeholder="Your mentor username"
              autoComplete="username"
            />
          </Field>

          {fetchingQ && <p className="text-sm text-muted-foreground">Loading question…</p>}
          {question && !fetchingQ && (
            <Field>
              <FieldLabel htmlFor="answer">{question}</FieldLabel>
              <Input
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Your answer"
                autoComplete="off"
              />
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="password">New password</FieldLabel>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </Field>

          <ul className="flex flex-col gap-1.5">
            {rules.map((rule) => {
              const ok = rule.test(password)
              return (
                <li
                  key={rule.label}
                  className={ok ? "flex items-center gap-2 text-sm text-success" : "flex items-center gap-2 text-sm text-muted-foreground"}
                >
                  <CheckCircle2Icon className="size-4" />
                  {rule.label}
                </li>
              )
            })}
          </ul>

          <Field data-invalid={confirm.length > 0 && !matches ? true : undefined}>
            <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
            <PasswordInput
              id="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
              aria-invalid={confirm.length > 0 && !matches ? true : undefined}
            />
            {confirm.length > 0 && !matches && <FieldDescription>Passwords do not match.</FieldDescription>}
          </Field>

          <Button type="submit" className="w-full" disabled={!canSubmit || loading}>
            {loading ? "Resetting…" : "Reset password"}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
