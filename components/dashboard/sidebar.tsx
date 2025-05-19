"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart,
  BookOpen,
  Calendar,
  Home,
  QrCode,
  Settings,
  Users,
  Clock,
  FileCheck,
  Upload,
  List,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardSidebarProps {
  user: {
    id: string
    name: string
    userType: string
  }
  isMobile?: boolean
}

export function DashboardSidebar({ user, isMobile = false }: DashboardSidebarProps) {
  const pathname = usePathname()

  const navItems = {
    student: [
      { href: "/dashboard/student", label: "Dashboard", icon: Home },
      { href: "/dashboard/student/scan", label: "Scan QR Code", icon: QrCode },
      { href: "/dashboard/student/absences", label: "My Absences", icon: Clock },
      { href: "/dashboard/student/justifications", label: "Submit Justification", icon: Upload },
      { href: "/dashboard/student/lessons", label: "Lessons", icon: BookOpen },
    ],
    teacher: [
      { href: "/dashboard/teacher", label: "Dashboard", icon: Home },
      { href: "/dashboard/teacher/qr-code", label: "Generate QR Code", icon: QrCode },
      { href: "/dashboard/teacher/attendance", label: "Attendance Records", icon: List },
      { href: "/dashboard/teacher/justifications", label: "Pending Justifications", icon: FileCheck },
    ],
    admin: [
      { href: "/dashboard/admin", label: "Dashboard", icon: Home },
      { href: "/dashboard/admin/programs", label: "Programs", icon: Calendar },
      { href: "/dashboard/admin/modules", label: "Modules", icon: BookOpen },
      { href: "/dashboard/admin/reports", label: "Reports", icon: BarChart },
    ],
    "tech-admin": [
      { href: "/dashboard/tech-admin", label: "Dashboard", icon: Home },
      { href: "/dashboard/tech-admin/users", label: "User Management", icon: Users },
      { href: "/dashboard/tech-admin/notifications", label: "Notifications", icon: Bell },
      { href: "/dashboard/tech-admin/statistics", label: "Statistics", icon: BarChart },
      { href: "/dashboard/tech-admin/settings", label: "System Settings", icon: Settings },
    ],
  }

  const items = navItems[user.userType as keyof typeof navItems] || []

  return (
    <nav
      className={cn(
        "bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800",
        isMobile ? "w-full" : "w-64 hidden md:block shrink-0",
      )}
    >
      <div className="p-4">
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
