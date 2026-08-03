"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Trophy, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { registerForEvent } from "@/services/content.service"

export function RegisterEventButton({ eventId, isRegisteredInitial = false }: { eventId: string, isRegisteredInitial?: boolean }) {
  const [loading, setLoading] = React.useState(false)
  const [registered, setRegistered] = React.useState(isRegisteredInitial)

  const handleRegister = async () => {
    setLoading(true)
    const res = await registerForEvent(eventId)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Successfully registered for event!")
      setRegistered(true)
    }
  }

  if (registered) {
    return (
      <Button className="w-full gap-2" variant="secondary" disabled>
        Registered
        <CheckCircle2 className="size-4" />
      </Button>
    )
  }

  return (
    <Button className="w-full gap-2" onClick={handleRegister} disabled={loading}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : "Register Now"}
      {!loading && <Trophy className="size-4" />}
    </Button>
  )
}
