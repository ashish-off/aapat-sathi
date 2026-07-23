import { Router } from "express";
import {
  getAmbulanceDashboard,
  acceptDispatch,
  rejectDispatch,
  registerAmbulance,
} from "../controllers/ambulance.controller.js";

const ambulanceRoute = Router();

// Register new ambulance
ambulanceRoute.post("/register", registerAmbulance);

// Get ambulance dashboard
ambulanceRoute.get("/:id/dashboard", getAmbulanceDashboard);

// Accept or reject a dispatch
ambulanceRoute.post("/dispatch/:dispatchId/accept", acceptDispatch);
ambulanceRoute.post("/dispatch/:dispatchId/reject", rejectDispatch);

export default ambulanceRoute;
