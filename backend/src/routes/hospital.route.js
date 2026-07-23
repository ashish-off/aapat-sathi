import express, { Router } from "express";
import {
  getIncomingResponse,
  matchProvider,
} from "../controllers/hospitalMatch.controller.js";

const hostelRoute = Router();

hostelRoute.get("/match/web", matchProvider);
hostelRoute.get("/match/sms", getIncomingResponse);
export default hostelRoute;
