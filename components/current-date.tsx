"use client"

import { useState, useEffect } from "react"

export function CurrentDate() {
  const [date, setDate] = useState<string>("")

  useEffect(() => {
    const updateDate = () => {
      const now = new Date()
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
      setDate(now.toLocaleDateString("en-US", options))
    }

    updateDate()
    const interval = setInterval(updateDate, 1000 * 60) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return <span className="font-medium">{date}</span>
}
