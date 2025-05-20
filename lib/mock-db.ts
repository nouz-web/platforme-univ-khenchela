import type { User, Course, Attendance, Justification, QRCode, Notification } from "./db-schema"
import bcryptjs from "bcryptjs"

// Mock database storage
let users: User[] = []
let courses: Course[] = []
let attendance: Attendance[] = []
let justifications: Justification[] = []
let qrCodes: QRCode[] = []
let notifications: Notification[] = []
let initialized = false

// Initialize the mock database with sample data
export async function initMockDb() {
  if (initialized) return true

  try {
    // Create the technical administrator
    const hashedPassword = await bcryptjs.hash("010218821", 10)

    users = [
      {
        id: "2020234049140",
        name: "Technical Administrator",
        password: hashedPassword,
        user_type: "tech-admin",
        created_at: new Date().toISOString(),
      },
      {
        id: "T12345",
        name: "Dr. Mohammed Alaoui",
        password: hashedPassword,
        user_type: "teacher",
        created_at: new Date().toISOString(),
      },
      {
        id: "S12345",
        name: "Ahmed Benali",
        password: hashedPassword,
        user_type: "student",
        created_at: new Date().toISOString(),
      },
      {
        id: "A12345",
        name: "Amina Tazi",
        password: hashedPassword,
        user_type: "admin",
        created_at: new Date().toISOString(),
      },
    ]

    courses = [
      {
        id: 1,
        name: "Introduction to Computer Science",
        type: "COUR",
        teacher_id: "T12345",
        semester: 1,
        year: "2023-2024",
      },
      {
        id: 2,
        name: "Programming Fundamentals",
        type: "TD",
        teacher_id: "T12345",
        semester: 1,
        year: "2023-2024",
      },
      {
        id: 3,
        name: "Data Structures",
        type: "TP",
        teacher_id: "T12345",
        semester: 1,
        year: "2023-2024",
      },
    ]

    attendance = [
      {
        id: 1,
        student_id: "S12345",
        course_id: 1,
        date: new Date().toISOString(),
        status: "present",
      },
    ]

    justifications = []
    qrCodes = []
    notifications = [
      {
        id: 1,
        title: "Welcome to the Absence Management Platform",
        message: "This platform helps manage student attendance using QR codes.",
        active: true,
        created_at: new Date().toISOString(),
        created_by: "2020234049140",
      },
    ]

    initialized = true
    return true
  } catch (error) {
    console.error("Error initializing mock database:", error)
    return false
  }
}

// User functions
export async function createUser(id: string, name: string, password: string, userType: string) {
  await initMockDb()

  const hashedPassword = await bcryptjs.hash(password, 10)

  const newUser: User = {
    id,
    name,
    password: hashedPassword,
    user_type: userType,
    created_at: new Date().toISOString(),
  }

  users.push(newUser)

  return { id, name, userType }
}

export async function getUserByIdAndPassword(id: string, password: string, userType: string) {
  await initMockDb()

  // For the Technical Administrator, use hardcoded credentials
  if (userType === "tech-admin" && id === "2020234049140" && password === "010218821") {
    return {
      id,
      name: "Technical Administrator",
      userType,
    }
  }

  const user = users.find((u) => u.id === id && u.user_type === userType)

  if (!user) {
    return null
  }

  const passwordMatch = await bcryptjs.compare(password, user.password)
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
  await initMockDb()

  if (userType) {
    return users
      .filter((u) => u.user_type === userType)
      .map((u) => ({
        id: u.id,
        name: u.name,
        user_type: u.user_type,
        created_at: u.created_at,
      }))
  }

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    user_type: u.user_type,
    created_at: u.created_at,
  }))
}

// Course functions
export async function createCourse(name: string, type: string, teacherId: string, semester: number, year: string) {
  await initMockDb()

  const newCourse: Course = {
    id: courses.length + 1,
    name,
    type,
    teacher_id: teacherId,
    semester,
    year,
  }

  courses.push(newCourse)

  return newCourse
}

export async function getCoursesByTeacher(teacherId: string) {
  await initMockDb()

  return courses.filter((c) => c.teacher_id === teacherId)
}

// Attendance functions
export async function recordAttendance(studentId: string, courseId: number, status: string) {
  await initMockDb()

  const newAttendance: Attendance = {
    id: attendance.length + 1,
    student_id: studentId,
    course_id: courseId,
    date: new Date().toISOString(),
    status,
  }

  attendance.push(newAttendance)

  return newAttendance
}

export async function getStudentAttendance(studentId: string) {
  await initMockDb()

  const attendanceRecords = attendance.filter((a) => a.student_id === studentId)

  return attendanceRecords.map((record) => {
    const course = courses.find((c) => c.id === record.course_id)
    return {
      ...record,
      course_name: course ? course.name : "Unknown Course",
      course_type: course ? course.type : "Unknown",
    }
  })
}

// QR Code functions
export async function createQRCode(teacherId: string, courseId: number, code: string, expiresAt: Date) {
  await initMockDb()

  const newQRCode: QRCode = {
    id: qrCodes.length + 1,
    teacher_id: teacherId,
    course_id: courseId,
    code,
    created_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
  }

  qrCodes.push(newQRCode)

  return newQRCode
}

export async function validateQRCode(code: string) {
  await initMockDb()

  const qrCode = qrCodes.find((q) => q.code === code)

  if (!qrCode || new Date(qrCode.expires_at) <= new Date()) {
    return null
  }

  const course = courses.find((c) => c.id === qrCode.course_id)

  return {
    ...qrCode,
    course_name: course ? course.name : "Unknown Course",
    course_type: course ? course.type : "Unknown",
  }
}

// Justification functions
export async function submitJustification(studentId: string, attendanceId: number, filePath: string) {
  await initMockDb()

  const newJustification: Justification = {
    id: justifications.length + 1,
    student_id: studentId,
    attendance_id: attendanceId,
    file_path: filePath,
    status: "pending",
    submitted_at: new Date().toISOString(),
  }

  justifications.push(newJustification)

  return newJustification
}

export async function getJustificationsByTeacher(teacherId: string) {
  await initMockDb()

  // Get teacher's courses
  const teacherCourses = courses.filter((c) => c.teacher_id === teacherId)
  const courseIds = teacherCourses.map((c) => c.id)

  // Get all justifications
  const results = []

  for (const justification of justifications) {
    const attendanceRecord = attendance.find((a) => a.id === justification.attendance_id)

    if (attendanceRecord && courseIds.includes(attendanceRecord.course_id)) {
      const course = courses.find((c) => c.id === attendanceRecord.course_id)
      const student = users.find((u) => u.id === justification.student_id)

      results.push({
        ...justification,
        absence_date: attendanceRecord ? attendanceRecord.date : null,
        course_name: course ? course.name : "Unknown Course",
        student_name: student ? student.name : "Unknown Student",
      })
    }
  }

  return results
}

export async function updateJustificationStatus(justificationId: number, status: string) {
  await initMockDb()

  const justification = justifications.find((j) => j.id === justificationId)

  if (justification) {
    justification.status = status
  }

  return { id: justificationId, status }
}

// Notification functions
export async function createNotification(title: string, message: string, createdBy: string) {
  await initMockDb()

  const newNotification: Notification = {
    id: notifications.length + 1,
    title,
    message,
    active: true,
    created_at: new Date().toISOString(),
    created_by: createdBy,
  }

  notifications.push(newNotification)

  return newNotification
}

export async function getActiveNotifications() {
  await initMockDb()

  return notifications.filter((n) => n.active)
}

// Initialize the database
initMockDb().catch(console.error)
