"use server"

// Mock in-memory database for browser preview
const mockDb = {
  users: [
    {
      id: "2020234049140",
      name: "Technical Administrator",
      password: "$2b$10$XdULVQH8Qg5UzQxQBUjkCeq/NjUFAgNuLrBGPZVfnL.76WoOcuTXm", // hashed "010218821"
      user_type: "tech-admin",
      created_at: new Date().toISOString(),
    },
    {
      id: "T12345",
      name: "Dr. Mohammed Alaoui",
      password: "$2b$10$XdULVQH8Qg5UzQxQBUjkCeq/NjUFAgNuLrBGPZVfnL.76WoOcuTXm", // hashed "password"
      user_type: "teacher",
      created_at: new Date().toISOString(),
    },
    {
      id: "S12345",
      name: "Ahmed Benali",
      password: "$2b$10$XdULVQH8Qg5UzQxQBUjkCeq/NjUFAgNuLrBGPZVfnL.76WoOcuTXm", // hashed "password"
      user_type: "student",
      created_at: new Date().toISOString(),
    },
    {
      id: "A12345",
      name: "Amina Tazi",
      password: "$2b$10$XdULVQH8Qg5UzQxQBUjkCeq/NjUFAgNuLrBGPZVfnL.76WoOcuTXm", // hashed "password"
      user_type: "admin",
      created_at: new Date().toISOString(),
    },
  ],
  courses: [
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
  ],
  attendance: [
    {
      id: 1,
      student_id: "S12345",
      course_id: 1,
      date: new Date().toISOString(),
      status: "present",
    },
    {
      id: 2,
      student_id: "S12345",
      course_id: 2,
      date: new Date(Date.now() - 86400000).toISOString(), // yesterday
      status: "absent",
    },
  ],
  justifications: [],
  qr_codes: [],
  notifications: [],
}

// Initialize the database schema
export async function initializeDb() {
  console.log("Mock database initialized")
  return true
}

// User functions
export async function createUser(id: string, name: string, password: string, userType: string) {
  // In a real implementation, we would hash the password
  mockDb.users.push({
    id,
    name,
    password: `hashed_${password}`, // Simulate hashing
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

  // For demo purposes, accept any password for existing users
  const user = mockDb.users.find((u) => u.id === id && u.user_type === userType)

  if (!user) {
    return null
  }

  // In a real implementation, we would compare the hashed password
  return {
    id: user.id,
    name: user.name,
    userType: user.user_type,
  }
}

export async function getAllUsers(userType?: string) {
  if (userType) {
    return mockDb.users
      .filter((u) => u.user_type === userType)
      .map((u) => ({
        id: u.id,
        name: u.name,
        user_type: u.user_type,
        created_at: u.created_at,
      }))
  }

  return mockDb.users.map((u) => ({
    id: u.id,
    name: u.name,
    user_type: u.user_type,
    created_at: u.created_at,
  }))
}

// Course functions
export async function createCourse(name: string, type: string, teacherId: string, semester: number, year: string) {
  const id = mockDb.courses.length + 1
  const newCourse = { id, name, type, teacher_id: teacherId, semester, year }
  mockDb.courses.push(newCourse)
  return newCourse
}

export async function getCoursesByTeacher(teacherId: string) {
  return mockDb.courses.filter((c) => c.teacher_id === teacherId)
}

// Attendance functions
export async function recordAttendance(studentId: string, courseId: number, status: string) {
  const id = mockDb.attendance.length + 1
  const newAttendance = {
    id,
    student_id: studentId,
    course_id: courseId,
    date: new Date().toISOString(),
    status,
  }
  mockDb.attendance.push(newAttendance)
  return newAttendance
}

export async function getStudentAttendance(studentId: string) {
  return mockDb.attendance
    .filter((a) => a.student_id === studentId)
    .map((a) => {
      const course = mockDb.courses.find((c) => c.id === a.course_id)
      return {
        ...a,
        course_name: course ? course.name : "Unknown Course",
        course_type: course ? course.type : "Unknown",
      }
    })
}

// QR Code functions
export async function createQRCode(teacherId: string, courseId: number, code: string, expiresAt: Date) {
  const id = mockDb.qr_codes.length + 1
  const newQRCode = {
    id,
    teacher_id: teacherId,
    course_id: courseId,
    code,
    created_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
  }
  mockDb.qr_codes.push(newQRCode)
  return newQRCode
}

export async function validateQRCode(code: string) {
  const qrCode = mockDb.qr_codes.find((qr) => qr.code === code && new Date(qr.expires_at) > new Date())

  if (!qrCode) return null

  const course = mockDb.courses.find((c) => c.id === qrCode.course_id)
  return {
    ...qrCode,
    course_name: course ? course.name : "Unknown Course",
    course_type: course ? course.type : "Unknown",
  }
}

// Justification functions
export async function submitJustification(studentId: string, attendanceId: number, filePath: string) {
  const id = mockDb.justifications.length + 1
  const newJustification = {
    id,
    student_id: studentId,
    attendance_id: attendanceId,
    file_path: filePath,
    status: "pending",
    submitted_at: new Date().toISOString(),
  }
  mockDb.justifications.push(newJustification)
  return newJustification
}

export async function getJustificationsByTeacher(teacherId: string) {
  const teacherCourses = mockDb.courses.filter((c) => c.teacher_id === teacherId).map((c) => c.id)

  return mockDb.justifications
    .filter((j) => {
      const attendance = mockDb.attendance.find((a) => a.id === j.attendance_id)
      return attendance && teacherCourses.includes(attendance.course_id)
    })
    .map((j) => {
      const attendance = mockDb.attendance.find((a) => a.id === j.attendance_id)
      const course = attendance ? mockDb.courses.find((c) => c.id === attendance.course_id) : null
      const student = mockDb.users.find((u) => u.id === j.student_id)

      return {
        ...j,
        absence_date: attendance ? attendance.date : null,
        course_name: course ? course.name : "Unknown Course",
        student_name: student ? student.name : "Unknown Student",
      }
    })
}

export async function updateJustificationStatus(justificationId: number, status: string) {
  const justification = mockDb.justifications.find((j) => j.id === justificationId)
  if (justification) {
    justification.status = status
  }
  return { id: justificationId, status }
}

// Notification functions
export async function createNotification(title: string, message: string, createdBy: string) {
  const id = mockDb.notifications.length + 1
  const newNotification = {
    id,
    title,
    message,
    active: true,
    created_at: new Date().toISOString(),
    created_by: createdBy,
  }
  mockDb.notifications.push(newNotification)
  return newNotification
}

export async function getActiveNotifications() {
  return mockDb.notifications.filter((n) => n.active)
}

// Initialize the mock database
initializeDb().catch(console.error)
