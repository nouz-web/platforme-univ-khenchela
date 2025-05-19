"use client"

import { useState } from "react"
import { AlertCircle, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function NotificationBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <Alert className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800">
      <AlertCircle className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle>Important Announcement</AlertTitle>
        <AlertDescription>
          Welcome to the new Absence Management Platform. Please contact the Technical Administrator if you encounter
          any issues.
        </AlertDescription>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </Alert>
  )
}
