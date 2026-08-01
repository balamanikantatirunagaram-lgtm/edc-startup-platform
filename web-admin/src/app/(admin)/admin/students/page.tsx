"use client"

import * as React from "react"
import { SearchIcon, CircleDotIcon, CircleXIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getAllStudents, toggleStudentSuspension, resetStudentPassword } from "@/services/admin.service"
import { IAdminStudent } from "@/types"

export default function AdminStudentsPage() {
  const [search, setSearch] = React.useState("")
  const [deptFilter, setDeptFilter] = React.useState("all")
  const [yearFilter, setYearFilter] = React.useState("all")
  const [students, setStudents] = React.useState<IAdminStudent[]>([])
  const [loading, setLoading] = React.useState(true)
  const [toggling, setToggling] = React.useState<string | null>(null)
  
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false)
  const [resettingUser, setResettingUser] = React.useState<{id: string, name: string} | null>(null)
  const [newPassword, setNewPassword] = React.useState("")
  const [resetting, setResetting] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    const data = await getAllStudents()
    setStudents(data)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const handleToggleSuspension = async (userId: string, currentStatus: boolean | undefined) => {
    setToggling(userId)
    const newStatus = !currentStatus
    const res = await toggleStudentSuspension(userId, newStatus)
    
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(`Student ${newStatus ? 'suspended' : 'activated'} successfully.`)
      await load() // refresh list
    }
    setToggling(null)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resettingUser || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    setResetting(true)
    const res = await resetStudentPassword(resettingUser.id, newPassword)
    setResetting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(`Password updated for ${resettingUser.name}`)
      setResetDialogOpen(false)
      setNewPassword("")
    }
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(search.toLowerCase()) ||
      student.niatId?.toLowerCase().includes(search.toLowerCase()) ||
      student.email?.toLowerCase().includes(search.toLowerCase())

    const matchesDept = deptFilter === "all" || student.department === deptFilter
    const matchesYear = yearFilter === "all" || student.academicYear === yearFilter

    return matchesSearch && matchesDept && matchesYear
  })
  
  const departments = Array.from(new Set(students.map(s => s.department).filter(Boolean)))
  const years = Array.from(new Set(students.map(s => s.academicYear).filter(Boolean)))

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Registered Students</h1>
        <p className="text-sm text-muted-foreground">Browse and search registered student founders.</p>
      </section>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or NIAT ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d: any) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((y: any) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Founders Directory ({filteredStudents.length})</CardTitle>
          <CardDescription>Lists registered profiles under the incubation group.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex justify-center items-center">
               <Loader2 className="animate-spin text-muted-foreground size-6" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic text-sm">
              No students match the criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                    <th className="p-4">Student</th>
                    <th className="p-4">Department &amp; Year</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-foreground">{student.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {student.niatId} · {student.email}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          <span>{student.department || 'N/A'}</span>
                          <span>{student.academicYear || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {student.isSuspended ? (
                          <div className="flex items-center gap-1.5 text-xs">
                            <CircleXIcon className="size-3 text-red-500 fill-red-500" />
                            <span className="text-red-600 font-medium">Suspended</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs">
                            <CircleDotIcon className="size-3 text-green-500 fill-green-500" />
                            <span className="text-foreground">Active</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setResettingUser({ id: student.id, name: student.name || 'Unknown' })
                              setNewPassword("")
                              setResetDialogOpen(true)
                            }}
                          >
                            Reset Password
                          </Button>
                          <Button
                            variant={student.isSuspended ? "default" : "destructive"}
                            size="sm"
                            disabled={toggling === student.id}
                            onClick={() => handleToggleSuspension(student.id, student.isSuspended)}
                          >
                            {toggling === student.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {student.isSuspended ? "Activate" : "Suspend"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleResetPassword}>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Set a new password for {resettingUser?.name}. They can use this immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input 
                type="text" 
                placeholder="New Password (min 6 chars)" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                required 
                minLength={6}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={resetting}>
                {resetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
