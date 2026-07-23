import { Router } from "express";
import {
  register,
  list,
  getOne,
  updateStatus,
  updateAvailability,
  getProviderDashboard,
} from "../controllers/providerController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// Public
router.post("/register", register);
router.get("/", list);
router.get("/:id", getOne);

// Protected — provider staff only, scoped to their own provider
router.patch("/:id/status", requireAuth, updateStatus);
router.patch("/:id/availability", requireAuth, updateAvailability);
router.get("/:id/dashboard", getProviderDashboard); // Add requireAuth here if needed

export default router;