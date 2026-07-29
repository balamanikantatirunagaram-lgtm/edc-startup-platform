"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import JoinTeamPage from "./join/page"
import CreateTeamPage from "./create/page"
import ManageTeamPage from "./manage/page"
import { UsersIcon, UserPlusIcon, SettingsIcon } from "lucide-react"

export default function TeamHubPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto mt-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Team Connect</h1>
        <p className="text-muted-foreground">Join an existing team, create a new one, or manage your current team.</p>
      </div>

      <Tabs defaultValue="join" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="join" className="flex items-center gap-2">
            <UserPlusIcon className="size-4" />
            Join Team
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <UsersIcon className="size-4" />
            Create Team
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <SettingsIcon className="size-4" />
            Manage Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="join" className="mt-6">
          <JoinTeamPage />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <CreateTeamPage />
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <ManageTeamPage />
        </TabsContent>
      </Tabs>
    </div>
  )
}
