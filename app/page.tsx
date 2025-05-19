import type { Metadata } from "next"
import Image from "next/image"
import { Clock } from "lucide-react"
import { CurrentDate } from "@/components/current-date"
import { UserTypeCard } from "@/components/user-type-card"
import { NotificationBanner } from "@/components/notification-banner"

export const metadata: Metadata = {
  title: "Absence Management Platform - Khenchela University Abbas Laghour",
  description: "A platform for managing student absences at Khenchela University Abbas Laghour",
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-950 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image src="/logo.png" alt="University Logo" width={60} height={60} className="rounded-full" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Khenchela University Abbas Laghour</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Absence Management Platform</p>
            </div>
          </div>
          <div className="flex items-center mt-4 md:mt-0 space-x-2 text-gray-700 dark:text-gray-300">
            <Clock className="h-5 w-5" />
            <CurrentDate />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <NotificationBanner />

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">
            Welcome to the Absence Management Platform
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <UserTypeCard
              title="Students"
              description="Register attendance, view absence history, submit justifications"
              icon="GraduationCap"
              color="blue"
              href="/login?type=student"
            />

            <UserTypeCard
              title="Teachers"
              description="Generate QR codes, view attendance records, validate justifications"
              icon="BookOpen"
              color="green"
              href="/login?type=teacher"
            />

            <UserTypeCard
              title="Administration"
              description="Manage programs, timetables, and modules"
              icon="Building"
              color="amber"
              href="/login?type=admin"
            />

            <UserTypeCard
              title="Technical Administrator"
              description="Manage accounts, system maintenance, and security"
              icon="Shield"
              color="red"
              href="/login?type=tech-admin"
            />
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-gray-950 shadow-inner mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Absence Management Platform - Khenchela University Abbas Laghour
          </p>
        </div>
      </footer>
    </div>
  )
}
