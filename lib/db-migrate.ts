import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import Database from "better-sqlite3"
import * as schema from "./db-schema"
import bcrypt from "bcrypt"
import { eq } from "drizzle-orm"

// Initialize the database
const sqlite = new Database(process.env.DATABASE_PATH || "./db/absence_management.db")
const db = drizzle(sqlite, { schema })

// Run migrations
async function runMigrations() {
  console.log("Running migrations...")
  migrate(db, { migrationsFolder: "./db/migrations" })
  console.log("Migrations completed")
}

// Seed initial data
async function seedDatabase() {
  console.log("Checking if database needs seeding...")

  // Check if tech admin exists
  const techAdmin = await db.select().from(schema.users).where(eq(schema.users.id, "2020234049140")).get()

  if (!techAdmin) {
    console.log("Seeding database with initial data...")

    // Hash the password
    const hashedPassword = await bcrypt.hash("010218821", 10)

    // Insert tech admin
    await db.insert(schema.users).values({
      id: "2020234049140",
      name: "Technical Administrator",
      password: hashedPassword,
      user_type: "tech-admin",
      created_at: new Date().toISOString(),
    })

    // Insert sample users
    await db.insert(schema.users).values([
      {
        id: "T12345",
        name: "Dr. Mohammed Alaoui",
        password: hashedPassword, // Using same hash for demo
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
    ])

    // Insert sample courses
    await db.insert(schema.courses).values([
      {
        name: "Introduction to Computer Science",
        type: "COUR",
        teacher_id: "T12345",
        semester: 1,
        year: "2023-2024",
      },
      {
        name: "Programming Fundamentals",
        type: "TD",
        teacher_id: "T12345",
        semester: 1,
        year: "2023-2024",
      },
      {
        name: "Data Structures",
        type: "TP",
        teacher_id: "T12345",
        semester: 1,
        year: "2023-2024",
      },
    ])

    console.log("Database seeded successfully")
  } else {
    console.log("Database already seeded")
  }
}

// Main function to run migrations and seed the database
async function initializeDatabase() {
  try {
    await runMigrations()
    await seedDatabase()
    console.log("Database initialization completed")
  } catch (error) {
    console.error("Error initializing database:", error)
    process.exit(1)
  }
}

// Run the initialization
initializeDatabase()
