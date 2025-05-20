import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface NotificationBannerProps {
  title: string
  message: string
}

export function NotificationBanner({ title, message }: NotificationBannerProps) {
  return (
    <Alert className="rounded-none border-t-0 border-x-0 bg-amber-50 text-amber-800 dark:bg-amber-900 dark:text-amber-50">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="font-semibold">{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
