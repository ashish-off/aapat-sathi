import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../config/env.js";

const { Pool } = pg;

const pool = new Pool({
    connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool);
export { pool };