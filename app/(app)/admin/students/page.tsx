"use client"

import * as React from "react"
import { SearchIcon, FilterIcon, CircleDotIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DEPARTMENTS, ACADEMIC_YEARS, adminStudents } from "@/lib/mock-data"
import { StatusBadge } from "@/components/status-badge"

export default function AdminStudentsPage() {
  const [search, setSearch] = React.useState("")
  const [deptFilter, setDeptFilter] = React.useState("all")
  const [yearFilter, setYearFilter] = React.useState("all")

  const filteredStudents = adminStudents.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(search.toLowerCase()) ||
      student.niatId.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase())

    const matchesDept = deptFilter === "all" || student.department === deptFilter
    const matchesYear = yearFilter === "all" || student.academicYear === yearFilter

    return matchesSearch && matchesDept && matchesYear
  })

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
                {DEPARTMENTS.map((d) => (
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
                {ACADEMIC_YEARS.map((y) => (
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
          {filteredStudents.length === 0 ? (
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
                    <th className="p-4">Startup</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {filteredStudents.map((student) => (
                    <tr key={student.niatId} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-foreground">{student.fullName}</span>
                          <span className="text-xs text-muted-foreground">
                            {student.niatId} · {student.email}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          <span>{student.department}</span>
                          <span>{student.academicYear}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {student.startupName ? (
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-foreground text-xs">{student.startupName}</span>
                            {student.startupStatus && (
                              <div className="scale-90 origin-left">
                                <StatusBadge status={student.startupStatus} />
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">None registered</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs">
                          <CircleDotIcon
                            className={`size-3 ${student.active ? "text-green-500 fill-green-500" : "text-muted-foreground"}`}
                          />
                          <span className={student.active ? "text-foreground" : "text-muted-foreground"}>
                            {student.active ? "Active" : "Inactive"}
                          </span>
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
    </div>
  )
}
