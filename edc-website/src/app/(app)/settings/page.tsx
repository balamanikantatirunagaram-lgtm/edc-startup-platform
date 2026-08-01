"use client"

import * as React from "react"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import {
  SettingsIcon,
  BellIcon,
  KeyRoundIcon,
  PaletteIcon,
  CheckIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

const rules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /[0-9]/.test(v) },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Notification states
  const [emailAlerts, setEmailAlerts] = React.useState(true)
  const [feedbackAlerts, setFeedbackAlerts] = React.useState(true)
  const [weeklyDigest, setWeeklyDigest] = React.useState(false)

  // Password change states
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [updating, setUpdating] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const rulesPassed = rules.filter((r) => r.test(newPassword)).length
  const allPassed = rulesPassed === rules.length
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword
  const canUpdate = allPassed && passwordsMatch && currentPassword.length > 0

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Notification preferences updated.")
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canUpdate) return

    setUpdating(true)
    setTimeout(() => {
      setUpdating(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Password updated successfully.")
    }, 1200)
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <SettingsIcon className="size-5 text-primary" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">Manage your personal settings, security, and notification details.</p>
      </section>

      {/* Theme preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PaletteIcon className="size-4 text-primary" />
            Appearance
          </CardTitle>
          <CardDescription>Customize the application theme.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">Theme Theme</span>
              <span className="text-xs text-muted-foreground">Select between Light, Dark, or System mode.</span>
            </div>
            <div className="flex gap-2">
              {["light", "dark", "system"].map((t) => (
                <Button
                  key={t}
                  variant={theme === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme(t)}
                  className="capitalize"
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BellIcon className="size-4 text-primary" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Manage how and when you receive updates.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveNotifications} className="flex flex-col gap-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex flex-col gap-0.5 max-w-[80%]">
                <span className="text-sm font-semibold">Email Alerts</span>
                <span className="text-xs text-muted-foreground">Receive real-time email notifications on status shifts.</span>
              </div>
              <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div className="flex flex-col gap-0.5 max-w-[80%]">
                <span className="text-sm font-semibold">Feedback Alerts</span>
                <span className="text-xs text-muted-foreground">Get notified immediately when reviewers post feedback.</span>
              </div>
              <Switch checked={feedbackAlerts} onCheckedChange={setFeedbackAlerts} />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div className="flex flex-col gap-0.5 max-w-[80%]">
                <span className="text-sm font-semibold">Weekly Summaries</span>
                <span className="text-xs text-muted-foreground">Receive a clean dashboard progress summary every Sunday.</span>
              </div>
              <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
            </div>
            <Button type="submit" className="self-end mt-2">
              Save Preferences
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security change password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRoundIcon className="size-4 text-primary" />
            Security &amp; Password
          </CardTitle>
          <CardDescription>Update your password details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword}>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="currPass">Current Password</FieldLabel>
                <Input
                  id="currPass"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="newPass">New Password</FieldLabel>
                  <Input
                    id="newPass"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confPass">Confirm New Password</FieldLabel>
                  <Input
                    id="confPass"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </Field>
              </div>

              {/* Password strength checklist */}
              {newPassword.length > 0 && (
                <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 pt-2">
                  {rules.map((rule) => {
                    const ok = rule.test(newPassword)
                    return (
                      <li
                        key={rule.label}
                        className={`flex items-center gap-1.5 text-xs ${
                          ok ? "text-success" : "text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`flex size-4 items-center justify-center rounded-full ${
                            ok ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {ok ? <CheckIcon className="size-3" /> : <XIcon className="size-3" />}
                        </span>
                        {rule.label}
                      </li>
                    )
                  })}
                </ul>
              )}

              <Button type="submit" className="self-end mt-2" disabled={!canUpdate || updating}>
                {updating ? "Updating..." : "Change Password"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
