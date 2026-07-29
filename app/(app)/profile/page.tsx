"use client"

import * as React from "react"
import { toast } from "sonner"
import { CheckCircle2Icon, GlobeIcon, Loader2Icon } from "lucide-react"

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
  FieldDescription,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getMyProfile, updateMyProfile } from "@/app/actions/profile"

// Instead of mock-data, hardcode options or keep if they are constants
const ACADEMIC_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Alumni"]
const DEPARTMENTS = ["Computer Science", "Information Technology", "Electronics", "Electrical", "Mechanical", "Civil", "Other"]

export default function ProfilePage() {
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  const [skills, setSkills] = React.useState<string[]>([])
  const [skillInput, setSkillInput] = React.useState("")

  const [fullName, setFullName] = React.useState("")
  const [collegeId, setCollegeId] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [department, setDepartment] = React.useState("")
  const [academicYear, setAcademicYear] = React.useState("")
  const [linkedin, setLinkedin] = React.useState("")
  const [github, setGithub] = React.useState("")
  const [portfolio, setPortfolio] = React.useState("")
  const [niatId, setNiatId] = React.useState("")
  const [avatarUrl, setAvatarUrl] = React.useState("")

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const fetchProfile = async () => {
    setLoading(true)
    const { profile } = await getMyProfile()
    if (profile) {
      setFullName(profile.name || "")
      setCollegeId(profile.collegeId || "")
      setEmail(profile.email || "")
      setPhone(profile.phone || "")
      setDepartment(profile.department || "")
      setAcademicYear(profile.academicYear || "")
      setLinkedin(profile.linkedin || "")
      setGithub(profile.github || "")
      setPortfolio(profile.portfolio || "")
      setSkills(profile.skills || [])
      setNiatId(profile.niat_id || "")
      setAvatarUrl(profile.avatarUrl || "")
    }
    setLoading(false)
  }

  React.useEffect(() => {
    fetchProfile()
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result as string
      setAvatarUrl(base64String)
      await updateMyProfile({ avatarUrl: base64String })
      toast.success("Profile picture updated successfully.")
    }
    reader.readAsDataURL(file)
  }

  function addSkill(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === "Enter") {
      e.preventDefault()
      const value = skillInput.trim()
      if (value && !skills.includes(value)) setSkills((s) => [...s, value])
      setSkillInput("")
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await updateMyProfile({
      name: fullName,
      collegeId,
      email,
      phone,
      department,
      academicYear,
      linkedin,
      github,
      portfolio,
      skills,
    })
    setSaving(false)
    
    if (res.success) {
      toast.success("Profile updated successfully.")
    } else {
      toast.error(res.error || "Failed to update profile.")
    }
  }

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
    : "U"

  let completionScore = 0
  if (fullName) completionScore += 10
  if (collegeId) completionScore += 10
  if (email) completionScore += 10
  if (phone) completionScore += 10
  if (department) completionScore += 10
  if (academicYear) completionScore += 10
  if (skills.length > 0) completionScore += 10
  if (linkedin) completionScore += 10
  if (github) completionScore += 10
  if (portfolio) completionScore += 10

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-muted-foreground gap-2">
        <Loader2Icon className="size-8 animate-spin text-primary" />
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-6 animate-in fade-in duration-300">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        style={{ display: "none" }}
        accept="image/*"
      />
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>
        <p className="text-sm text-muted-foreground">Keep your details current so reviewers can reach you.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <Avatar className="size-20">
                <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={fullName} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold">{fullName || 'Add your name'}</span>
                <span className="text-sm text-muted-foreground">{niatId || 'No NIAT ID'}</span>
              </div>
              {department && <Badge variant="secondary">{department}</Badge>}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                Change photo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall</span>
                  <span className="font-medium">{completionScore}%</span>
                </div>
                <Progress value={completionScore} />
              </div>
              <ul className="flex flex-col gap-2 text-sm">
                <ChecklistItem done={completionScore > 30}>Basic details added</ChecklistItem>
                <ChecklistItem done={!!linkedin}>LinkedIn linked</ChecklistItem>
                <ChecklistItem done={!!portfolio}>Portfolio link</ChecklistItem>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="collegeId">College ID</FieldLabel>
                    <Input
                      id="collegeId"
                      value={collegeId}
                      onChange={(e) => setCollegeId(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="phone">Phone</FieldLabel>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="department">Department</FieldLabel>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger id="department">
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
                    <FieldLabel htmlFor="year">Academic year</FieldLabel>
                    <Select value={academicYear} onValueChange={setAcademicYear}>
                      <SelectTrigger id="year">
                        <SelectValue placeholder="Select year" />
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
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="skills">Skills</FieldLabel>
                  <Input
                    id="skills"
                    placeholder="Type a skill and press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={addSkill}
                  />
                  <div className="flex flex-wrap gap-2 pt-1">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                        <button type="button" onClick={() => setSkills(skills.filter(s => s !== skill))} className="ml-1 opacity-50 hover:opacity-100">x</button>
                      </Badge>
                    ))}
                  </div>
                </Field>

                <FieldSet>
                  <FieldLegend>Social links</FieldLegend>
                  <FieldDescription>Add profiles reviewers can check.</FieldDescription>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="linkedin">
                        <Linkedin className="size-4" />
                        LinkedIn
                      </FieldLabel>
                      <Input
                        id="linkedin"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="github">
                        <Github className="size-4" />
                        GitHub
                      </FieldLabel>
                      <Input
                        id="github"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="portfolio">
                        <GlobeIcon className="size-4" />
                        Portfolio
                      </FieldLabel>
                      <Input
                        id="portfolio"
                        placeholder="https://"
                        value={portfolio}
                        onChange={(e) => setPortfolio(e.target.value)}
                      />
                    </Field>
                  </FieldGroup>
                </FieldSet>
              </FieldGroup>
            </CardContent>
          </Card>

          <Separator />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                fetchProfile()
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

function ChecklistItem({ children, done }: { children: React.ReactNode; done?: boolean }) {
  return (
    <li className={done ? "flex items-center gap-2 text-foreground" : "flex items-center gap-2 text-muted-foreground"}>
      <CheckCircle2Icon className={done ? "size-4 text-green-500" : "size-4 text-muted-foreground/40"} />
      {children}
    </li>
  )
}
