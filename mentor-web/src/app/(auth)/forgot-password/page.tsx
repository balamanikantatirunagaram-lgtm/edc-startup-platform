"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getSecurityQuestion, resetPasswordWithSecurityAnswer } from "@/services/auth.service"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { PasswordInput } from "@/components/shared/PasswordInput"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [step, setStep] = React.useState<1 | 2>(1)
  
  const [username, setUsername] = React.useState("")
  const [question, setQuestion] = React.useState("")

  async function onStepOneSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await getSecurityQuestion(username)
      if (res.error) {
        toast.error(res.error)
        setLoading(false)
        return
      }
      
      setQuestion(res.question!)
      setStep(2)
      setLoading(false)
    } catch (err) {
      toast.error("An unexpected error occurred.")
      setLoading(false)
    }
  }

  async function onStepTwoSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const data = new FormData(e.currentTarget)
    
    const answer = String(data.get("answer") ?? "")
    const password = String(data.get("password") ?? "")

    try {
      const res = await resetPasswordWithSecurityAnswer(username, answer, password)
      if (res.error) {
        toast.error(res.error)
        setLoading(false)
        return
      }
      
      toast.success("Password reset successfully. You can now login.")
      router.push("/login")
    } catch (err) {
      toast.error("An unexpected error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-balance">
          Reset your password
        </h2>
        <p className="text-sm text-muted-foreground text-pretty">
          {step === 1 ? "Enter your username to retrieve your security question." : "Answer your security question to reset your password."}
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={onStepOneSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                name="username"
                placeholder="mentor_john"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Field>
            
            <Button type="submit" size="lg" disabled={loading || !username}>
              {loading ? "Searching…" : "Find Account"}
            </Button>
          </FieldGroup>
        </form>
      ) : (
        <form onSubmit={onStepTwoSubmit}>
          <FieldGroup>
            <div className="bg-muted p-4 rounded-md text-sm mb-4 font-medium">
              Question: {question}
            </div>

            <Field>
              <FieldLabel htmlFor="answer">Your Answer</FieldLabel>
              <Input
                id="answer"
                name="answer"
                placeholder="Answer here"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">New Password</FieldLabel>
              <PasswordInput id="password" name="password" required minLength={6} />
            </Field>
            
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? "Resetting…" : "Reset Password"}
            </Button>
            
            <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={loading}>
              Back
            </Button>
          </FieldGroup>
        </form>
      )}

      <p className="text-center text-xs text-muted-foreground mt-4">
        Remember your password?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
