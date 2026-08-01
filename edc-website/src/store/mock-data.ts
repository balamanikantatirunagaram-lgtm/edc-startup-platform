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
  fullName: "Loading...",
  collegeId: "",
  phone: "",
  email: "",
  department: "",
  academicYear: "",
  skills: [],
  linkedin: "",
  github: "",
  portfolio: "",
  role: "student",
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
  attachments: {},
  status: "Draft",
  ownerNiatId: "",
  createdAt: "",
  updatedAt: "",
  history: [],
}

export const notifications: AppNotification[] = [
  {
    id: "n_1",
    type: "feedback",
    title: "New feedback on LoopLearn",
    message: "Dr. Neha Kapoor left a note on your financial model.",
    read: false,
    createdAt: "2 hours ago",
  },
  {
    id: "n_2",
    type: "submitted",
    title: "Application under review",
    message: "Your startup LoopLearn moved to Under Review.",
    read: false,
    createdAt: "1 day ago",
  },
  {
    id: "n_3",
    type: "profile",
    title: "Complete your profile",
    message: "Add your portfolio link to reach 100% profile completion.",
    read: true,
    createdAt: "3 days ago",
  },
  {
    id: "n_4",
    type: "submitted",
    title: "Application submitted",
    message: "LoopLearn was submitted successfully.",
    read: true,
    createdAt: "1 week ago",
  },
]

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

export const adminStudents: AdminStudent[] = [
  {
    niatId: "NIAT2023CS045",
    fullName: "Aarav Sharma",
    email: "aarav.sharma@niat.edu",
    department: "Computer Science",
    academicYear: "3rd Year",
    active: true,
    startupName: "LoopLearn",
    startupStatus: "Under Review",
    joinedAt: "2025-01-14",
  },
  {
    niatId: "NIAT2022EC012",
    fullName: "Diya Menon",
    email: "diya.menon@niat.edu",
    department: "Electronics & Communication",
    academicYear: "4th Year",
    active: true,
    startupName: "VoltPack",
    startupStatus: "Approved",
    joinedAt: "2024-11-02",
  },
  {
    niatId: "NIAT2023ME088",
    fullName: "Rohan Gupta",
    email: "rohan.gupta@niat.edu",
    department: "Mechanical",
    academicYear: "3rd Year",
    active: true,
    startupName: "AgriSense",
    startupStatus: "Submitted",
    joinedAt: "2025-02-20",
  },
  {
    niatId: "NIAT2024IT003",
    fullName: "Sara Iyer",
    email: "sara.iyer@niat.edu",
    department: "Information Technology",
    academicYear: "2nd Year",
    active: true,
    startupName: "MediQueue",
    startupStatus: "Needs Improvement",
    joinedAt: "2025-03-11",
  },
  {
    niatId: "NIAT2022BA021",
    fullName: "Kabir Nair",
    email: "kabir.nair@niat.edu",
    department: "Business Administration",
    academicYear: "4th Year",
    active: false,
    joinedAt: "2024-09-08",
  },
  {
    niatId: "NIAT2023DS017",
    fullName: "Ananya Rao",
    email: "ananya.rao@niat.edu",
    department: "Design",
    academicYear: "3rd Year",
    active: true,
    startupName: "Palette",
    startupStatus: "Incubation Ready",
    joinedAt: "2025-01-30",
  },
]

export const adminStartups: (StartupApplication & { owner: string })[] = [
  {
    ...currentStartup,
    owner: "Aarav Sharma",
  },
  {
    id: "s_5522",
    name: "VoltPack",
    tagline: "Swappable battery packs for last-mile delivery fleets.",
    category: "Hardware / IoT",
    stage: "Early Revenue",
    founder: "Diya Menon",
    coFounders: [],
    teamMembers: [{ name: "Diya Menon", role: "Founder" }],
    problem: "Delivery riders lose hours charging EVs mid-shift.",
    solution: "A network of swap stations with standardised battery packs.",
    targetCustomers: "Urban last-mile delivery fleets.",
    businessModel: "Hardware + subscription.",
    revenueModel: "Per-swap fee and fleet subscriptions.",
    currentProgress: "8 pilot stations, 3 fleet partners, ₹2.1L MRR.",
    expectedSupport: "Series-seed intros and manufacturing partners.",
    attachments: { documents: [] },
    status: "Approved",
    ownerNiatId: "NIAT2022EC012",
    owner: "Diya Menon",
    createdAt: "2025-03-02",
    updatedAt: "2025-07-10",
    history: [
      { status: "Submitted", date: "2025-04-01", reviewer: "System" },
      {
        status: "Approved",
        date: "2025-05-20",
        reviewer: "Dr. Neha Kapoor",
        feedback: "Excellent traction and clear unit economics.",
      },
    ],
  },
  {
    id: "s_5523",
    name: "AgriSense",
    tagline: "Soil intelligence for smallholder farms.",
    category: "AI / ML",
    stage: "Prototype",
    founder: "Rohan Gupta",
    coFounders: [],
    teamMembers: [{ name: "Rohan Gupta", role: "Founder" }],
    problem: "Farmers over-irrigate and over-fertilise without soil data.",
    solution: "Low-cost soil sensors with an AI advisory app.",
    targetCustomers: "Smallholder farms in semi-arid regions.",
    businessModel: "Hardware kit + advisory subscription.",
    revenueModel: "Kit sales and seasonal advisory plans.",
    currentProgress: "Working prototype validated on 4 farms.",
    expectedSupport: "Grant funding and agri-network mentors.",
    attachments: { documents: [] },
    status: "Submitted",
    ownerNiatId: "NIAT2023ME088",
    owner: "Rohan Gupta",
    createdAt: "2025-06-25",
    updatedAt: "2025-07-05",
    history: [{ status: "Submitted", date: "2025-07-05", reviewer: "System" }],
  },
  {
    id: "s_5524",
    name: "MediQueue",
    tagline: "Zero-wait OPD scheduling for clinics.",
    category: "HealthTech",
    stage: "MVP",
    founder: "Sara Iyer",
    coFounders: [],
    teamMembers: [{ name: "Sara Iyer", role: "Founder" }],
    problem: "Patients wait hours in disorganised OPD queues.",
    solution: "Smart token and scheduling app for small clinics.",
    targetCustomers: "Independent clinics and polyclinics.",
    businessModel: "SaaS per clinic.",
    revenueModel: "Monthly per-clinic subscription.",
    currentProgress: "MVP piloted at 2 clinics.",
    expectedSupport: "Product mentorship and healthcare compliance guidance.",
    attachments: { documents: [] },
    status: "Needs Improvement",
    ownerNiatId: "NIAT2024IT003",
    owner: "Sara Iyer",
    createdAt: "2025-05-14",
    updatedAt: "2025-07-18",
    history: [
      { status: "Submitted", date: "2025-06-10", reviewer: "System" },
      {
        status: "Needs Improvement",
        date: "2025-07-18",
        reviewer: "Prof. Vikram Sethi",
        feedback:
          "Clarify data-privacy approach and add a clearer revenue projection.",
        nextSteps: "Resubmit with an updated compliance section.",
      },
    ],
  },
]

export const activityLogs: ActivityLog[] = [
  {
    id: "a_1",
    actor: "Dr. Neha Kapoor",
    action: "left feedback on",
    target: "LoopLearn",
    timestamp: "2 hours ago",
  },
  {
    id: "a_2",
    actor: "Prof. Vikram Sethi",
    action: "requested changes on",
    target: "MediQueue",
    timestamp: "1 day ago",
  },
  {
    id: "a_3",
    actor: "Dr. Neha Kapoor",
    action: "approved",
    target: "VoltPack",
    timestamp: "3 days ago",
  },
  {
    id: "a_4",
    actor: "Rohan Gupta",
    action: "submitted",
    target: "AgriSense",
    timestamp: "5 days ago",
  },
]

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
