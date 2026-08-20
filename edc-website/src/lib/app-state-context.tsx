"use client"

import * as React from "react"
import {
  UserProfile,
  StartupApplication,
  AppNotification,
  AdminStudent,
  ActivityLog,
  StartupStatus,
  currentUser as initialUser,
  currentStartup as initialStartup,
  notifications as initialNotifications,
  adminStudents as initialStudents,
  adminStartups as initialStartups,
  activityLogs as initialLogs,
} from "@/store/mock-data"
import { getCurrentUser } from "@/services/auth.service"

interface AppStateContextProps {
  currentUser: UserProfile
  currentStartup: StartupApplication
  notifications: AppNotification[]
  adminStudents: AdminStudent[]
  adminStartups: (StartupApplication & { owner: string })[]
  activityLogs: ActivityLog[]
  updateUserProfile: (profile: Partial<UserProfile>) => void
  updateCurrentStartup: (startup: Partial<StartupApplication>) => void
  markNotificationRead: (id: string) => void
  toggleNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  deleteNotification: (id: string) => void
  addReviewFeedback: (
    startupId: string,
    status: StartupStatus,
    reviewer: string,
    feedback?: string,
    nextSteps?: string
  ) => void
  addActivityLog: (actor: string, action: string, target: string) => void
}

const AppStateContext = React.createContext<AppStateContextProps | undefined>(undefined)

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = React.useState<UserProfile>(initialUser)
  const [currentStartup, setCurrentStartup] = React.useState<StartupApplication>(initialStartup)
  const [notifications, setNotifications] = React.useState<AppNotification[]>(initialNotifications)
  const [adminStudents, setAdminStudents] = React.useState<AdminStudent[]>(initialStudents)
  const [adminStartups, setAdminStartups] = React.useState<(StartupApplication & { owner: string })[]>(initialStartups)
  const [activityLogs, setActivityLogs] = React.useState<ActivityLog[]>(initialLogs)

  // Hydrate state from localStorage in useEffect
  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem("edc_user")
      const storedStartup = localStorage.getItem("edc_startup")
      const storedNotifications = localStorage.getItem("edc_notifications")
      const storedStudents = localStorage.getItem("edc_students")
      const storedStartups = localStorage.getItem("edc_startups")
      const storedLogs = localStorage.getItem("edc_logs")

      if (storedUser) setCurrentUser(JSON.parse(storedUser))
      if (storedStartup) setCurrentStartup(JSON.parse(storedStartup))
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications))
      if (storedStudents) setAdminStudents(JSON.parse(storedStudents))
      if (storedStartups) setAdminStartups(JSON.parse(storedStartups))
      if (storedLogs) setActivityLogs(JSON.parse(storedLogs))

      // Always fetch real user on load and override mock data
      getCurrentUser().then(user => {
        if (user && (user.name || user.niatId)) {
          setCurrentUser(prev => {
            const next = { 
              ...prev, 
              fullName: user.name || user.niatId, 
              niatId: user.niatId, 
              email: user.email,
              avatarUrl: user.avatarUrl,
              collegeId: user.collegeId,
              phone: user.phone,
              department: user.department,
              academicYear: user.academicYear,
              linkedin: user.linkedin,
              github: user.github,
              portfolio: user.portfolio,
              skills: user.skills || [],
            }
            
            let completedFields = 0
            if (next.fullName) completedFields += 10
            if (next.collegeId) completedFields += 10
            if (next.phone) completedFields += 10
            if (next.email) completedFields += 10
            if (next.department) completedFields += 10
            if (next.academicYear) completedFields += 10
            if (next.skills && next.skills.length > 0) completedFields += 10
            if (next.linkedin) completedFields += 10
            if (next.github) completedFields += 10
            if (next.portfolio) completedFields += 10
            next.profileCompletion = completedFields

            localStorage.setItem("edc_user", JSON.stringify(next))
            return next
          })
        } else if (!user) {
          // If no authenticated user, clear user localStorage to prevent cross-account pollution
          localStorage.removeItem("edc_user")
          localStorage.removeItem("edc_startup")
          setCurrentUser(initialUser)
          setCurrentStartup(initialStartup)
        }
      }).catch(console.error)
    } catch (e) {
      console.error("Failed to load local state", e)
    }
  }, [])

  // Sync to localStorage Helper
  const sync = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (e) {
      console.error("Failed to sync local state", e)
    }
  }

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      // Calculate completion dynamically
      const fullProfile = { ...prev, ...profile }
      let completedFields = 0
      if (fullProfile.fullName) completedFields += 10
      if (fullProfile.collegeId) completedFields += 10
      if (fullProfile.phone) completedFields += 10
      if (fullProfile.email) completedFields += 10
      if (fullProfile.department) completedFields += 10
      if (fullProfile.academicYear) completedFields += 10
      if (fullProfile.skills && fullProfile.skills.length > 0) completedFields += 10
      if (fullProfile.linkedin) completedFields += 10
      if (fullProfile.github) completedFields += 10
      if (fullProfile.portfolio) completedFields += 10
      fullProfile.profileCompletion = completedFields

      sync("edc_user", fullProfile)

      // Also update student list record
      setAdminStudents((students) => {
        const updated = students.map((s) =>
          s.niatId === prev.niatId
            ? {
                ...s,
                fullName: fullProfile.fullName,
                email: fullProfile.email,
                department: fullProfile.department,
                academicYear: fullProfile.academicYear,
              }
            : s
        )
        sync("edc_students", updated)
        return updated
      })

      return fullProfile
    })
  }

  const updateCurrentStartup = (startup: Partial<StartupApplication>) => {
    setCurrentStartup((prev) => {
      const updated = { ...prev, ...startup }
      sync("edc_startup", updated)

      // Also sync admin startups list
      setAdminStartups((prevList) => {
        const updatedList = prevList.map((item) =>
          item.id === prev.id ? { ...item, ...startup } : item
        )
        sync("edc_startups", updatedList)
        return updatedList
      })

      // Sync startup name on students list
      if (startup.name) {
        setAdminStudents((prevStudents) => {
          const updatedStudents = prevStudents.map((s) =>
            s.niatId === prev.ownerNiatId ? { ...s, startupName: startup.name } : s
          )
          sync("edc_students", updatedStudents)
          return updatedStudents
        })
      }

      return updated
    })
  }

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      sync("edc_notifications", updated)
      return updated
    })
  }

  const toggleNotificationRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
      sync("edc_notifications", updated)
      return updated
    })
  }

  const markAllNotificationsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }))
      sync("edc_notifications", updated)
      return updated
    })
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id)
      sync("edc_notifications", updated)
      return updated
    })
  }

  const addReviewFeedback = (
    startupId: string,
    status: StartupStatus,
    reviewer: string,
    feedback?: string,
    nextSteps?: string
  ) => {
    const historyEvent = {
      status,
      date: new Date().toISOString().split("T")[0],
      reviewer,
      feedback,
      nextSteps,
    }

    // Update startups list
    setAdminStartups((prevList) => {
      const updatedList = prevList.map((item) => {
        if (item.id === startupId) {
          const newItem = {
            ...item,
            status,
            history: [...item.history, historyEvent],
          }
          // If this is the current student's startup, update it too
          if (item.id === currentStartup.id) {
            setCurrentStartup(newItem)
            sync("edc_startup", newItem)
          }
          return newItem
        }
        return item
      })
      sync("edc_startups", updatedList)
      return updatedList
    })

    // Update students list status
    setAdminStudents((prevStudents) => {
      const updatedStudents = prevStudents.map((s) => {
        const matchingStartup = adminStartups.find((as) => as.id === startupId)
        if (matchingStartup && s.niatId === matchingStartup.ownerNiatId) {
          return { ...s, startupStatus: status }
        }
        return s
      })
      sync("edc_students", updatedStudents)
      return updatedStudents
    })

    // Add activity log
    addActivityLog(reviewer, `evaluated status to ${status} for`, currentStartup.name)

    // Add a notification for student
    const newNotif: AppNotification = {
      id: `n_${Date.now()}`,
      type: status === "Approved" ? "approved" : status === "Needs Improvement" ? "changes" : "feedback",
      title: `Startup Evaluation Updated`,
      message: `${reviewer} updated status of your application to ${status}.${feedback ? ` Note: "${feedback}"` : ""}`,
      read: false,
      createdAt: "Just now",
    }
    setNotifications((prev) => {
      const updated = [newNotif, ...prev]
      sync("edc_notifications", updated)
      return updated
    })
  }

  const addActivityLog = (actor: string, action: string, target: string) => {
    setActivityLogs((prev) => {
      const newLog: ActivityLog = {
        id: `a_${Date.now()}`,
        actor,
        action,
        target,
        timestamp: "Just now",
      }
      const updated = [newLog, ...prev]
      sync("edc_logs", updated)
      return updated
    })
  }

  return (
    <AppStateContext.Provider
      value={{
        currentUser,
        currentStartup,
        notifications,
        adminStudents,
        adminStartups,
        activityLogs,
        updateUserProfile,
        updateCurrentStartup,
        markNotificationRead,
        toggleNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        addReviewFeedback,
        addActivityLog,
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const context = React.useContext(AppStateContext)
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider")
  }
  return context
}
