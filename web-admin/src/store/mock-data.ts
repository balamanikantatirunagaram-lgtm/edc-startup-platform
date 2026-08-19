export type StartupStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Needs Improvement"
  | "Approved"
  | "Incubation Ready"

export const STARTUP_STATUS_FLOW: StartupStatus[] = [
  "Draft",
  "Submitted",
  "Under Review",
  "Needs Improvement",
  "Approved",
  "Incubation Ready",
]

export const STARTUP_CATEGORIES = [
  "SaaS",
  "Fintech",
  "HealthTech",
  "EdTech",
  "E-commerce",
  "AI / ML",
  "Hardware / IoT",
  "Sustainability",
  "Consumer App",
  "Other",
] as const

export const STARTUP_STAGES = [
  "Ideation",
  "Prototype",
  "MVP",
  "Early Revenue",
  "Growth",
] as const

export const DEPARTMENTS = [
  "Computer Science",
  "Electronics & Communication",
  "Mechanical",
  "Electrical",
  "Civil",
  "Information Technology",
  "Business Administration",
  "Design",
] as const

export const ACADEMIC_YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
] as const

export type UserRole = "student" | "admin"

export type UserProfile = {
  id: string
  niatId: string
  fullName: string
  collegeId: string
  phone: string
  email: string
  department: string
  academicYear: string
  skills: string[]
  linkedin: string
  github?: string
  portfolio?: string
  role: UserRole
  avatarUrl?: string
  active: boolean
  passwordChanged: boolean
  profileCompletion: number
}

export type StatusEvent = {
  status: StartupStatus
  date: string
  reviewer: string
  feedback?: string
  nextSteps?: string
}

export type StartupApplication = {
  id: string
  name: string
  tagline: string
  category: string
  stage: string
  founder: string
  coFounders: string[]
  teamMembers: { name: string; role: string }[]
  problem: string
  solution: string
  targetCustomers: string
  businessModel: string
  revenueModel: string
  currentProgress: string
  expectedSupport: string
  attachments: {
    pitchDeck?: string
    prototype?: string
    website?: string
    demoVideo?: string
    documents: string[]
  }
  status: StartupStatus
  history: StatusEvent[]
  ownerNiatId: string
  createdAt: string
  updatedAt: string
}

export type NotificationType =
  | "submitted"
  | "approved"
  | "rejected"
  | "changes"
  | "profile"
  | "feedback"

export type AppNotification = {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
}

export type ActivityLog = {
  id: string
  actor: string
  action: string
  target: string
  timestamp: string
}

export const currentUser: UserProfile = {
  id: "",
  niatId: "",
  fullName: "",
  collegeId: "",
  phone: "",
  email: "",
  department: "",
  academicYear: "",
  skills: [],
  linkedin: "",
  github: "",
  portfolio: "",
  role: "admin",
  active: true,
  passwordChanged: true,
  profileCompletion: 0,
}

export const currentStartup: StartupApplication = {
  id: "",
  name: "No Startup Registered",
  tagline: "Register your startup to access EDC resources.",
  category: "-",
  stage: "-",
  founder: "",
  coFounders: [],
  teamMembers: [],
  problem: "",
  solution: "",
  targetCustomers: "",
  businessModel: "",
  revenueModel: "",
  currentProgress: "Go to 'Create Team' to register your startup.",
  expectedSupport: "",
  attachments: { documents: [] },
  status: "Draft",
  ownerNiatId: "",
  createdAt: "",
  updatedAt: "",
  history: [],
}

export const notifications: AppNotification[] = []

export type AdminStudent = {
  niatId: string
  fullName: string
  email: string
  department: string
  academicYear: string
  active: boolean
  startupName?: string
  startupStatus?: StartupStatus
  joinedAt: string
}

export const adminStudents: AdminStudent[] = []

export const adminStartups: (StartupApplication & { owner: string })[] = []

export const activityLogs: ActivityLog[] = []

export const adminMetrics = {
  totalStudents: adminStudents.length,
  totalStartups: adminStartups.length,
  pendingReviews: adminStartups.filter(
    (s) => s.status === "Submitted" || s.status === "Under Review",
  ).length,
  approved: adminStartups.filter(
    (s) => s.status === "Approved" || s.status === "Incubation Ready",
  ).length,
  needsImprovement: adminStartups.filter((s) => s.status === "Needs Improvement")
    .length,
}
