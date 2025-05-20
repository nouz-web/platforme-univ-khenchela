import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotificationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      <Alert className="mb-6 bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-50 dark:border-amber-800">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-lg font-semibold">System Maintenance</AlertTitle>
        <AlertDescription className="text-base">
          The notifications system is currently undergoing maintenance. We apologize for any inconvenience this may
          cause. Our technical team is working to restore full functionality as soon as possible.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Notifications Center</CardTitle>
          <CardDescription>View and manage your notifications</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">Service Temporarily Unavailable</h3>
          <p className="text-center text-muted-foreground max-w-md">
            The notifications service is currently unavailable due to scheduled maintenance. Please check back later. We
            appreciate your patience.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
