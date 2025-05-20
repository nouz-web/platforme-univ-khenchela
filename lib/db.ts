"use server"

import { getDbClient } from "./db-client"
import * as schema from "./db-schema"
import { eq, and, sql } from "drizzle-orm"
import bcrypt from "bcrypt"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

const db = getDbClient()

// Initialize the database schema
export async function initializeDb() {
  try {
    // Check if we can query the database
    await db.select().from(schema.users).limit(1)
    return true
  } catch (error) {
    console.error("Database initialization error:", error)
    return false
  }
}

// Session management
export async function createSession(userId: string) {
  const sessionId = uuidv4()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

  await db.insert(schema.sessions).values({
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt.toISOString(),
  })

  cookies().set("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  })

  return sessionId
}

export async function getUserFromSession() {
  const sessionId = cookies().get("session_id")?.value

  if (!sessionId) return null

  const session = await db.select().from(schema.sessions).where(eq(schema.sessions.id, sessionId)).get()

  if (!session || new Date(session.expires_at) < new Date()) {
    cookies().delete("session_id")
    return null
  }

  const user = await db.select().from(schema.users).where(eq(schema.users.id, session.user_id)).get()

  if (!user) {
    cookies().delete("session_id")
    return null
  }

  return {
    id: user.id,
    name: user.name,
    userType: user.user_type,
  }
}

export async function deleteSession() {
  const sessionId = cookies().get("session_id")?.value

  if (sessionId) {
    await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId))
    cookies().delete("session_id")
  }
}

// User functions
export async function createUser(id: string, name: string, password: string, userType: string) {
  const hashedPassword = await bcrypt.hash(password, 10)

  await db.insert(schema.users).values({
    id,
    name,
    password: hashedPassword,
    user_type: userType,
    created_at: new Date().toISOString(),
  })

  return { id, name, userType }
}

export async function getUserByIdAndPassword(id: string, password: string, userType: string) {
  // For the Technical Administrator, use hardcoded credentials
  if (userType === "tech-admin" && id === "2020234049140" && password === "010218821") {
    return {
      id,
      name: "Technical Administrator",
      userType,
    }
  }

  const user = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.id, id), eq(schema.users.user_type, userType)))
    .get()

  if (!user) {
    return null
  }

  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    return null
  }

  return {
    id: user.id,
    name: user.name,
    userType: user.user_type,
  }
}

export async function getAllUsers(userType?: string) {
  if (userType) {
    const users = await db.select().from(schema.users).where(eq(schema.users.user_type, userType))
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      user_type: u.user_type,
      created_at: u.created_at,
    }))
  }

  const users = await db.select().from(schema.users)
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    user_type: u.user_type,
    created_at: u.created_at,
  }))
}

// Course functions
export async function createCourse(name: string, type: string, teacherId: string, semester: number, year: string) {
  const result = await db
    .insert(schema.courses)
    .values({
      name,
      type,
      teacher_id: teacherId,
      semester,
      year,
    })
    .returning()

  return result[0]
}

export async function getCoursesByTeacher(teacherId: string) {
  return await db.select().from(schema.courses).where(eq(schema.courses.teacher_id, teacherId))
}

// Attendance functions
export async function recordAttendance(studentId: string, courseId: number, status: string) {
  // Check if attendance already exists for this student and course today
  const today = new Date().toISOString().split("T")[0]
  const existingAttendance = await db
    .select()
    .from(schema.attendance)
    .where(
      and(
        eq(schema.attendance.student_id, studentId),
        eq(schema.attendance.course_id, courseId),
        sql`date(${schema.attendance.date}) = date('${today}')`,
      ),
    )
    .get()

  if (existingAttendance) {
    // Update existing attendance
    await db.update(schema.attendance).set({ status }).where(eq(schema.attendance.id, existingAttendance.id))

    return existingAttendance
  }

  // Create new attendance record
  const result = await db
    .insert(schema.attendance)
    .values({
      student_id: studentId,
      course_id: courseId,
      date: new Date().toISOString(),
      status,
    })
    .returning()

  return result[0]
}

export async function getStudentAttendance(studentId: string) {
  const attendanceRecords = await db.select().from(schema.attendance).where(eq(schema.attendance.student_id, studentId))

  const results = []
  for (const record of attendanceRecords) {
    const course = await db.select().from(schema.courses).where(eq(schema.courses.id, record.course_id)).get()
    results.push({
      ...record,
      course_name: course ? course.name : "Unknown Course",
      course_type: course ? course.type : "Unknown",
    })
  }

  return results
}

// QR Code functions
export async function createQRCode(teacherId: string, courseId: number, code: string, expiresAt: Date) {
  const result = await db
    .insert(schema.qr_codes)
    .values({
      teacher_id: teacherId,
      course_id: courseId,
      code,
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .returning()

  return result[0]
}

export async function validateQRCode(code: string) {
  const qrCode = await db.select().from(schema.qr_codes).where(eq(schema.qr_codes.code, code)).get()

  if (!qrCode || new Date(qrCode.expires_at) <= new Date()) {
    return null
  }

  const course = await db.select().from(schema.courses).where(eq(schema.courses.id, qrCode.course_id)).get()

  return {
    ...qrCode,
    course_name: course ? course.name : "Unknown Course",
    course_type: course ? course.type : "Unknown",
  }
}

// Justification functions
export async function submitJustification(studentId: string, attendanceId: number, filePath: string) {
  const result = await db
    .insert(schema.justifications)
    .values({
      student_id: studentId,
      attendance_id: attendanceId,
      file_path: filePath,
      status: "pending",
      submitted_at: new Date().toISOString(),
    })
    .returning()

  return result[0]
}

export async function getJustificationsByTeacher(teacherId: string) {
  // Get teacher's courses
  const courses = await db.select().from(schema.courses).where(eq(schema.courses.teacher_id, teacherId))
  const courseIds = courses.map((c) => c.id)

  // Get all justifications
  const justifications = await db.select().from(schema.justifications)
  const results = []

  for (const justification of justifications) {
    const attendance = await db
      .select()
      .from(schema.attendance)
      .where(eq(schema.attendance.id, justification.attendance_id))
      .get()

    if (attendance && courseIds.includes(attendance.course_id)) {
      const course = await db.select().from(schema.courses).where(eq(schema.courses.id, attendance.course_id)).get()
      const student = await db.select().from(schema.users).where(eq(schema.users.id, justification.student_id)).get()

      results.push({
        ...justification,
        absence_date: attendance ? attendance.date : null,
        course_name: course ? course.name : "Unknown Course",
        student_name: student ? student.name : "Unknown Student",
      })
    }
  }

  return results
}

export async function updateJustificationStatus(justificationId: number, status: string) {
  await db.update(schema.justifications).set({ status }).where(eq(schema.justifications.id, justificationId))

  return { id: justificationId, status }
}

// Notification functions
export async function createNotification(title: string, message: string, createdBy: string) {
  const result = await db
    .insert(schema.notifications)
    .values({
      title,
      message,
      active: true,
      created_at: new Date().toISOString(),
      created_by: createdBy,
    })
    .returning()

  return result[0]
}

export async function getActiveNotifications() {
  return await db.select().from(schema.notifications).where(eq(schema.notifications.active, true))
}

// Initialize the database
initializeDb().catch(console.error)
