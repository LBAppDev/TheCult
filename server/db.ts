import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. DB features will not work.");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgres://localhost:5432/postgres" });
export const db = drizzle(pool, { schema });
