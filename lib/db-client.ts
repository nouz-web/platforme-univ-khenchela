import { drizzle } from "drizzle-orm/better-sqlite3"
import Database from "better-sqlite3"
import * as schema from "./db-schema"

// Initialize the database connection
let db: ReturnType<typeof drizzle> | null = null

export function getDbClient() {
  if (!db) {
    const sqlite = new Database(process.env.DATABASE_PATH || "./db/absence_management.db")
    db = drizzle(sqlite, { schema })
  }
  return db
}
