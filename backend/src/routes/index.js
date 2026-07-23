import { Router } from "express";
import authRoutes from "./authRoutes.js";
import providerRoutes from "./providerRoutes.js";
import hospitalRoute from "./hospital.route.js";
import ambulanceRoute from "./ambulance.route.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Aapat Sathi API" });
});

router.use("/auth", authRoutes);
router.use("/providers", providerRoutes);
router.use("/match", hospitalRoute);
router.use("/ambulances", ambulanceRoute);
// router.use("/emergencies", emergencyRoutes);

export default router;
