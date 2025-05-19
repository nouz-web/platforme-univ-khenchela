"use server"

import { cookies } from "next/headers"
import { getUserByIdAndPassword } from "@/lib/db"

export async function authenticateUser(id: string, password: string, userType: string) {
  try {
    // For the Technical Administrator, use hardcoded credentials
    if (userType === "tech-admin" && id === "2020234049140" && password === "010218821") {
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

      return { success: true }
    }

    // For other users, check the database
    const user = await getUserByIdAndPassword(id, password, userType)

    if (user) {
      // Set authentication cookie
      cookies().set(
        "user",
        JSON.stringify({
          id: user.id,
          userType,
          name: user.name,
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24, // 1 day
          path: "/",
        },
      )

      return { success: true }
    }

    return { success: false, message: "Invalid ID or password" }
  } catch (error) {
    console.error("Authentication error:", error)
    return { success: false, message: "Authentication failed" }
  }
}

export async function getCurrentUser() {
  const userCookie = cookies().get("user")

  if (!userCookie) {
    return null
  }

  try {
    return JSON.parse(userCookie.value)
  } catch {
    return null
  }
}

export async function logout() {
  cookies().delete("user")
  return { success: true }
}
