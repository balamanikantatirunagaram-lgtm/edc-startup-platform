"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  UserIcon,
  RocketIcon,
  FileTextIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  SparklesIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Brand } from "@/components/layout/Brand"

const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "AIDS", "AIML", "IT", "Other"]
const ACADEMIC_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"]
const STARTUP_CATEGORIES = ["Technology", "Healthcare", "Education", "Finance", "E-commerce", "Agriculture", "Other"]
const STARTUP_STAGES = ["Idea", "Prototype", "MVP", "Traction", "Scaling"]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = React.useState(1)

  // Step 1: Personal Info
  const [fullName, setFullName] = React.useState("")
  const [collegeId, setCollegeId] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [department, setDepartment] = React.useState("")
  const [academicYear, setAcademicYear] = React.useState("")

  // Step 2: Startup Profile
  const [startupName, setStartupName] = React.useState("")
  const [tagline, setTagline] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [stage, setStage] = React.useState("")

  // Step 3: Pitch
  const [problem, setProblem] = React.useState("")
  const [solution, setSolution] = React.useState("")
  const [targetCustomers, setTargetCustomers] = React.useState("")

  const [loading, setLoading] = React.useState(false)

  // Validation checks for each step
  const isStep1Valid = fullName.trim() !== "" && collegeId.trim() !== "" && email.trim() !== "" && phone.trim() !== "" && department !== "" && academicYear !== ""
  const isStep2Valid = startupName.trim() !== "" && tagline.trim() !== "" && category !== "" && stage !== ""
  const isStep3Valid = problem.trim() !== "" && solution.trim() !== "" && targetCustomers.trim() !== ""

  const handleNext = () => {
    if (step === 1 && !isStep1Valid) {
      toast.error("Please fill in all personal information fields.")
      return
    }
    if (step === 2 && !isStep2Valid) {
      toast.error("Please fill in all startup profile fields.")
      return
    }
    if (step === 3 && !isStep3Valid) {
      toast.error("Please answer all problem/solution questions.")
      return
    }

    if (step < 4) {
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      toast.error("Please make sure all steps are valid.")
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("Onboarding completed! Welcome to the platform.")
      router.push("/dashboard")
    }, 1500)
  }

  const progressPercent = ((step - 1) / 3) * 100

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 py-12 px-4 select-none">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      {/* Brand logo header */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <Brand subtitle={false} className="scale-110" />
        <p className="text-xs tracking-wider text-muted-foreground uppercase">Startup Incubator</p>
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-6">
        {/* Step progress indicator */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="relative flex items-center justify-between">
            {/* Background progress bar */}
            <div className="absolute left-0 top-1/2 -z-10 h-0.5 w-full -translate-y-1/2 bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Steps */}
            {[
              { label: "Profile", icon: UserIcon, stepNum: 1 },
              { label: "Startup", icon: RocketIcon, stepNum: 2 },
              { label: "Idea", icon: FileTextIcon, stepNum: 3 },
              { label: "Launch", icon: CheckCircle2Icon, stepNum: 4 },
            ].map((item) => {
              const Icon = item.icon
              const isCompleted = step > item.stepNum
              const isActive = step === item.stepNum

              return (
                <div key={item.stepNum} className="flex flex-col items-center gap-2">
                  <div
                    className={`flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : isActive
                        ? "bg-background border-primary text-primary shadow-[0_0_12px_rgba(var(--primary),0.2)]"
                        : "bg-background border-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckIcon className="size-5" />
                    ) : (
                      <Icon className="size-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors duration-300 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Dynamic form wizard cards */}
        <div className="transition-all duration-300">
          {step === 1 && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="size-5 text-primary animate-pulse" />
                  Tell us about yourself
                </CardTitle>
                <CardDescription>
                  Verify your profile details for EDC Cell records.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="collegeId">College ID</FieldLabel>
                    <Input
                      id="collegeId"
                      value={collegeId}
                      onChange={(e) => setCollegeId(e.target.value)}
                      placeholder="e.g. CS21B045"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@niat.edu"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="department">Department</FieldLabel>
                    <Select value={department} onValueChange={(v) => setDepartment(v ?? '')}>
                      <SelectTrigger id="department" className="w-full">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="academicYear">Academic Year</FieldLabel>
                    <Select value={academicYear} onValueChange={(v) => setAcademicYear(v ?? '')}>
                      <SelectTrigger id="academicYear" className="w-full">
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACADEMIC_YEARS.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RocketIcon className="size-5 text-primary animate-pulse" />
                  Your Startup Profile
                </CardTitle>
                <CardDescription>
                  Enter the core details of your venture.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <Field>
                    <FieldLabel htmlFor="startupName">Startup Name</FieldLabel>
                    <Input
                      id="startupName"
                      value={startupName}
                      onChange={(e) => setStartupName(e.target.value)}
                      placeholder="e.g. LoopLearn"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="tagline">Tagline</FieldLabel>
                    <Input
                      id="tagline"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="A short one-liner description"
                      required
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="category">Category</FieldLabel>
                      <Select value={category} onValueChange={(v) => setCategory(v ?? '')}>
                        <SelectTrigger id="category" className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {STARTUP_CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="stage">Current Stage</FieldLabel>
                      <Select value={stage} onValueChange={(v) => setStage(v ?? '')}>
                        <SelectTrigger id="stage" className="w-full">
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                          {STARTUP_STAGES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileTextIcon className="size-5 text-primary animate-pulse" />
                  Describe Your Venture
                </CardTitle>
                <CardDescription>
                  Briefly pitch the idea and targeted customers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <Field>
                    <FieldLabel htmlFor="problem">Problem Statement</FieldLabel>
                    <Textarea
                      id="problem"
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      placeholder="What pain point is your startup solving?"
                      className="min-h-[80px]"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="solution">Proposed Solution</FieldLabel>
                    <Textarea
                      id="solution"
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      placeholder="How does your product/service solve the problem?"
                      className="min-h-[80px]"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="targetCustomers">Target Customers</FieldLabel>
                    <Textarea
                      id="targetCustomers"
                      value={targetCustomers}
                      onChange={(e) => setTargetCustomers(e.target.value)}
                      placeholder="Who are your primary customers or users?"
                      className="min-h-[80px]"
                      required
                    />
                  </Field>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card className="animate-in zoom-in-95 duration-500 overflow-hidden relative border-primary/30">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="relative flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                  {/* Decorative pulse glow */}
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping duration-1000 opacity-60" />
                  <SparklesIcon className="size-10 animate-bounce" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">You&apos;re ready to launch!</CardTitle>
                <CardDescription className="mt-2 max-w-md">
                  All details are validated. You can update this profile or add attachments in the dashboard later. Let&apos;s get you onboarded!
                </CardDescription>

                <div className="mt-6 w-full rounded-lg border bg-muted/20 p-4 text-left text-sm max-w-md flex flex-col gap-2">
                  <div className="flex justify-between border-b pb-1.5 border-border/40">
                    <span className="text-muted-foreground">Founder:</span>
                    <span className="font-semibold text-foreground">{fullName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5 border-border/40">
                    <span className="text-muted-foreground">Startup:</span>
                    <span className="font-semibold text-primary">{startupName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Industry:</span>
                    <span className="font-semibold text-foreground">{category}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="w-full mt-8 flex justify-center">
                  <Button type="submit" size="lg" className="w-full max-w-md shadow-md gap-2" disabled={loading}>
                    {loading ? "Completing setup..." : "Enter Dashboard"}
                    <ArrowRightIcon className="size-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Form controls (back & next) */}
        {step < 4 && (
          <div className="flex items-center justify-between mt-2">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-1.5"
            >
              <ArrowLeftIcon className="size-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="gap-1.5"
            >
              Next
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
