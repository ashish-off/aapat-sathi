import express, { Router } from "express";
import {
  getIncomingResponse,
  matchProvider,
} from "../controllers/hospitalMatch.controller.js";

const hospitalRoute = Router();

hospitalRoute.get("/web", matchProvider);
hospitalRoute.post("/sms", getIncomingResponse);
export default hospitalRoute;
