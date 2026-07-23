import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

export async function registerUser({ name, email, password, role, providerId }) {
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
        const err = new Error("Email already registered");
        err.status = 409;
        throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db
        .insert(users)
        .values({
            name,
            email,
            passwordHash,
            role: role || "PROVIDER_STAFF",
            providerId: providerId || null,
        })
        .returning();

    return sanitizeUser(user);
}

export async function loginUser({ email, password }) {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
        const err = new Error("Invalid email or password");
        err.status = 401;
        throw err;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        const err = new Error("Invalid email or password");
        err.status = 401;
        throw err;
    }

    const token = jwt.sign(
        { id: user.id, role: user.role, providerId: user.providerId },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    return { token, user: sanitizeUser(user) };
}

function sanitizeUser(user) {
    const { passwordHash, ...safe } = user;
    return safe;
}