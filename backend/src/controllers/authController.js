import { registerUser, loginUser } from "../services/authService.js";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function register(req, res, next) {
    try {
        const { name, email, password, role, providerId } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await registerUser({ name, email, password, role, providerId });
        res.status(201).json({ user });
    } catch (err) {
        next(err);
    }
}

export async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const { token, user } = await loginUser({ email, password });
        res.cookie("token", token, COOKIE_OPTIONS);
        res.json({ user });
    } catch (err) {
        next(err);
    }
}

export async function logout(req, res) {
    res.clearCookie("token", COOKIE_OPTIONS);
    res.json({ message: "Logged out" });
}

export async function me(req, res) {
    res.json({ user: req.user });
}