import { type NextRequest, NextResponse } from "next/server"
import { getUserByIdAndPassword, createSession } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { id, password, userType } = await request.json()

    if (!id || !password || !userType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const user = await getUserByIdAndPassword(id, password, userType)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create a session
    await createSession(user.id)

    return NextResponse.json({
      id: user.id,
      name: user.name,
      userType: user.userType,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}
