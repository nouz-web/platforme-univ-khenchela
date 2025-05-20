import { type NextRequest, NextResponse } from "next/server"
import { validateQRCode, recordAttendance, getUserFromSession } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Get the current user from the session
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ message: "You must be logged in to record attendance" }, { status: 401 })
    }

    if (user.userType !== "student") {
      return NextResponse.json({ message: "Only students can record attendance" }, { status: 403 })
    }

    // Get the QR code from the request body
    const { qrCode } = await request.json()

    if (!qrCode) {
      return NextResponse.json({ message: "QR code is required" }, { status: 400 })
    }

    // Validate the QR code
    const validatedQR = await validateQRCode(qrCode)

    if (!validatedQR) {
      return NextResponse.json({ message: "Invalid or expired QR code" }, { status: 400 })
    }

    // Record the attendance
    const attendance = await recordAttendance(user.id, validatedQR.course_id, "present")

    return NextResponse.json({
      message: "Attendance recorded successfully",
      attendance,
      course: {
        name: validatedQR.course_name,
        type: validatedQR.course_type,
      },
    })
  } catch (error) {
    console.error("Error recording attendance:", error)
    return NextResponse.json({ message: "Failed to record attendance" }, { status: 500 })
  }
}
