import express, { Router } from "express";
import { handleChatbotMessage } from "../controllers/chatbot.controller.js";

const chatbotRoute = Router();

chatbotRoute.post("/message", handleChatbotMessage);

export default chatbotRoute;
