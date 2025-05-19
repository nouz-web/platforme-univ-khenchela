"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, GraduationCap, BookOpen, Building, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { authenticateUser } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType = searchParams.get("type") || "student"

  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const userTypeInfo = {
    student: {
      title: "Student Login",
      description: "Access your attendance records and submit justifications",
      icon: <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      color: "border-blue-200 dark:border-blue-800",
    },
    teacher: {
      title: "Teacher Login",
      description: "Generate QR codes and manage attendance",
      icon: <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />,
      color: "border-green-200 dark:border-green-800",
    },
    admin: {
      title: "Administration Login",
      description: "Manage programs, timetables, and modules",
      icon: <Building className="h-8 w-8 text-amber-600 dark:text-amber-400" />,
      color: "border-amber-200 dark:border-amber-800",
    },
    "tech-admin": {
      title: "Technical Administrator Login",
      description: "Manage accounts and system maintenance",
      icon: <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />,
      color: "border-red-200 dark:border-red-800",
    },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await authenticateUser(id, password, userType)

      if (result.success) {
        // Redirect to the appropriate dashboard
        router.push(`/dashboard/${userType}`)
      } else {
        setError(result.message || "Authentication failed")
      }
    } catch (err) {
      setError("An error occurred during authentication")
    } finally {
      setIsLoading(false)
    }
  }

  const info = userTypeInfo[userType as keyof typeof userTypeInfo]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-950 shadow-sm p-4">
        <div className="container mx-auto">
          <Link
            href="/"
            className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className={`w-full max-w-md border-2 ${info.color}`}>
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-2">{info.icon}</div>
            <CardTitle className="text-2xl">{info.title}</CardTitle>
            <CardDescription>{info.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID</Label>
                <Input
                  id="id"
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="Enter your ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Forgot your password? Contact the Technical Administrator.
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
