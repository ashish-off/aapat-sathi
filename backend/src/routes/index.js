import { Router } from "express";

export const apiRouter = Router();

apiRouter.get("/status", (req, res) => {
    res.json({ ok: true, message: "API is ready" });
});