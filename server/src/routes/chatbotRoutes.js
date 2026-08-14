import express from "express";
import { chatbotValidation, sendChatbotMessage } from "../controllers/chatbotController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const chatbotRouter = express.Router();

chatbotRouter.use(authenticate);

chatbotRouter.post("/message", chatbotValidation, validate, sendChatbotMessage);
