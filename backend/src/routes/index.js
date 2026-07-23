import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Aapat Sathi API" });
});

// router.use("/auth", authRoutes);
// router.use("/providers", providerRoutes);
// router.use("/emergencies", emergencyRoutes);

export default router;