import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index.js";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Self-healing schema sync: ensure region column exists on PostgreSQL ambulances table
pool
  .query('ALTER TABLE "ambulances" ADD COLUMN IF NOT EXISTS "region" VARCHAR(255);')
  .then(() => console.log("Database schema synchronized: ambulances.region column ready."))
  .catch((err) => console.warn("Database schema sync notice:", err.message));

export const db = drizzle(pool, { schema });