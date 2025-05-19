"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Bell, LogOut, Menu, Moon, Sun, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CurrentDate } from "@/components/current-date"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { logout } from "@/lib/auth"
import { useTheme } from "next-themes"

interface DashboardHeaderProps {
  user: {
    id: string
    name: string
    userType: string
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const userTypeLabel = {
    student: "Student",
    teacher: "Teacher",
    admin: "Administration",
    "tech-admin": "Technical Administrator",
  }

  return (
    <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Menu</div>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
              </div>
              <div className="py-2">
                <DashboardSidebar user={user} isMobile />
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/placeholder.svg?height=40&width=40"
              alt="University Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="hidden md:block">
              <div className="font-semibold text-sm">Khenchela University</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Absence Management</div>
            </div>
          </Link>
        </div>

        <div className="hidden md:flex items-center text-sm text-gray-600 dark:text-gray-400">
          <CurrentDate />
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/notifications">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Link>
          </Button>

          <div className="flex items-center space-x-2">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {userTypeLabel[user.userType as keyof typeof userTypeLabel]}
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
