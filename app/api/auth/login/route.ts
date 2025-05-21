import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, password, userType } = body

    console.log("Login attempt:", { id, userType })

    if (!id || !password || !userType) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // For the Technical Administrator, use hardcoded credentials
    if (userType === "tech-admin" && id === "2020234049140" && password === "010218821") {
      console.log("Technical Administrator login successful")

      // Set authentication cookie
      cookies().set(
        "user",
        JSON.stringify({
          id,
          userType,
          name: "Technical Administrator",
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24, // 1 day
          path: "/",
        },
      )

      return NextResponse.json({ success: true })
    }

    // For demo purposes, accept these credentials
    if (userType === "student" && id === "S12345" && password === "password") {
      console.log("Student login successful")

      cookies().set(
        "user",
        JSON.stringify({
          id,
          userType,
          name: "Ahmed Benali",
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24, // 1 day
          path: "/",
        },
      )

      return NextResponse.json({ success: true })
    }

    if (userType === "teacher" && id === "T12345" && password === "password") {
      console.log("Teacher login successful")

      cookies().set(
        "user",
        JSON.stringify({
          id,
          userType,
          name: "Dr. Mohammed Alaoui",
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24, // 1 day
          path: "/",
        },
      )

      return NextResponse.json({ success: true })
    }

    if (userType === "admin" && id === "A12345" && password === "password") {
      console.log("Admin login successful")

      cookies().set(
        "user",
        JSON.stringify({
          id,
          userType,
          name: "Amina Tazi",
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24, // 1 day
          path: "/",
        },
      )

      return NextResponse.json({ success: true })
    }

    console.log("Invalid credentials")
    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 500 })
  }
}
