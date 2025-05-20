"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState<string | null>(null)

  // Get the user type from the URL query parameter using useSearchParams
  useEffect(() => {
    const type = searchParams.get("type")
    if (type) {
      setUserType(type)
    } else {
      // Default to student if no type is specified
      setUserType("student")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!id || !password || !userType) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, password, userType }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Login failed")
      }

      const data = await response.json()

      // Redirect based on user type
      switch (userType) {
        case "student":
          router.push("/dashboard/student")
          break
        case "teacher":
          router.push("/dashboard/teacher")
          break
        case "admin":
          router.push("/dashboard/admin")
          break
        case "tech-admin":
          router.push("/dashboard/tech-admin")
          break
        default:
          router.push("/")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getUserTypeLabel = () => {
    switch (userType) {
      case "student":
        return "Student"
      case "teacher":
        return "Teacher"
      case "admin":
        return "Administrator"
      case "tech-admin":
        return "Technical Administrator"
      default:
        return "User"
    }
  }

  // Don't render until userType is set
  if (!userType) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="University Logo" width={120} height={120} priority />
          </div>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your credentials to access the {getUserTypeLabel()} dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id">ID Number</Label>
              <Input
                id="id"
                placeholder={`Enter your ${getUserTypeLabel()} ID`}
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => router.push("/")} className="text-sm text-muted-foreground">
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
