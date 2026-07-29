"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import JoinTeamPage from "./join/page"
import CreateTeamPage from "./create/page"
import ManageTeamPage from "./manage/page"
import { UsersIcon, UserPlusIcon, SettingsIcon, Loader2Icon } from "lucide-react"
import { getMyTeamStatus } from "@/app/actions/team"

export default function TeamHubPage() {
  const [loading, setLoading] = React.useState(true)
  const [status, setStatus] = React.useState<any>(null)

  React.useEffect(() => {
    getMyTeamStatus().then(res => {
      setStatus(res)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (status?.hasTeam) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto mt-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">My Team: {status.team.name}</h1>
          <p className="text-muted-foreground">Team Code: <span className="font-mono bg-muted px-2 py-1 rounded text-primary">{status.team.code}</span> (Share this with your members!)</p>
        </div>
        <ManageTeamPage />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto mt-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Team Connect</h1>
        <p className="text-muted-foreground">Join an existing team or create a new one.</p>
      </div>

      <Tabs defaultValue="join" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="join" className="flex items-center gap-2">
            <UserPlusIcon className="size-4" />
            Join Team
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <UsersIcon className="size-4" />
            Create Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="join" className="mt-6">
          <JoinTeamPage />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <CreateTeamPage />
        </TabsContent>
      </Tabs>
    </div>
  )
}
