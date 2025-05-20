import { type NextRequest, NextResponse } from "next/server"
import { getUserByIdAndPassword, createSession } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { id, password, userType } = await request.json()

    if (!id || !password || !userType) {
      return NextResponse.json({ message: "ID, password, and user type are required" }, { status: 400 })
    }

    const user = await getUserByIdAndPassword(id, password, userType)

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Create a session
    const sessionId = await createSession(user.id)

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        userType: user.userType,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "An error occurred during login" }, { status: 500 })
  }
}
