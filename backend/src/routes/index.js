import { Router } from "express";
import authRoutes from "./authRoutes.js";
import providerRoutes from "./providerRoutes.js"
import { findMatchingProviders } from "../services/matchingService.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Aapat Sathi API" });
});

router.use("/auth", authRoutes);
router.use("/providers", providerRoutes);
// router.use("/emergencies", emergencyRoutes);


router.get("/test-match", async (req, res, next) => {
  try {
    const { lat, lng, capabilities } = req.query;
    const caps = capabilities ? capabilities.split(",") : [];
    const results = await findMatchingProviders(parseFloat(lat), parseFloat(lng), caps);
    res.json({ results });
  } catch (err) {
    next(err);
  }
});

export default router;