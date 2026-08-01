import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-md w-full border-red-200 shadow-md">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="size-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Account Suspended</CardTitle>
          <CardDescription className="text-base mt-2 text-foreground">
            Your access to the EDC portal has been temporarily suspended by the administrator.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground mt-4 space-y-6">
          <p>
            If you believe this is a mistake or need further clarification, please contact the EDC Cell coordinator at your department.
          </p>
          <div className="pt-4 border-t">
            <Link href="/login">
              <Button variant="outline" className="w-full">Return to Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
