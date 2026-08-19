"use client"

import * as React from "react"
import { Loader2, UsersIcon, BuildingIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getInvestors, getIncubators, deleteInvestor, deleteIncubator } from "@/services/network.service"

export default function AdminNetworkPage() {
  const [investors, setInvestors] = React.useState<any[]>([])
  const [incubators, setIncubators] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  const load = React.useCallback(async () => {
    setLoading(true)
    const [invData, incData] = await Promise.all([
      getInvestors(),
      getIncubators()
    ])
    setInvestors(invData)
    setIncubators(incData)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const handleDelInvestor = async (id: string) => {
    if (!confirm("Delete this investor?")) return
    try {
      await deleteInvestor(id)
      toast.success("Investor deleted")
      load()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleDelIncubator = async (id: string) => {
    if (!confirm("Delete this incubator?")) return
    try {
      await deleteIncubator(id)
      toast.success("Incubator deleted")
      load()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Network Management</h1>
        <p className="text-sm text-muted-foreground">Manage Investors and Incubators.</p>
      </section>

      <Tabs defaultValue="investors">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="investors" className="gap-2">
            <UsersIcon className="size-4" /> Investors
          </TabsTrigger>
          <TabsTrigger value="incubators" className="gap-2">
            <BuildingIcon className="size-4" /> Incubators
          </TabsTrigger>
        </TabsList>

        <TabsContent value="investors" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Investors ({investors.length})</CardTitle>
              <CardDescription>People who fund startups.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground size-6" /></div>
              ) : investors.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground italic text-sm">No investors found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                        <th className="p-4">Name/Company</th>
                        <th className="p-4">Investment Size</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {investors.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-4 font-medium">{item.user_id} - {item.company_name}</td>
                          <td className="p-4 text-muted-foreground">{item.investment_range}</td>
                          <td className="p-4 text-right">
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelInvestor(item.id)}>
                              <Trash2Icon className="size-4 mr-2" /> Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incubators" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Incubators ({incubators.length})</CardTitle>
              <CardDescription>Organizations that support startups.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground size-6" /></div>
              ) : incubators.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground italic text-sm">No incubators found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                        <th className="p-4">Name</th>
                        <th className="p-4">Focus</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {incubators.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-4 font-medium">{item.name}</td>
                          <td className="p-4 text-muted-foreground">{item.focus_areas?.join(', ')}</td>
                          <td className="p-4 text-right">
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelIncubator(item.id)}>
                              <Trash2Icon className="size-4 mr-2" /> Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
