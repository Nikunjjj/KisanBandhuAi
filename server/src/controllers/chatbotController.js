import { body } from "express-validator";
import { answerFarmerQuestion } from "../services/chatbotService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const chatbotValidation = [
  body("message").trim().isLength({ min: 2, max: 600 }).withMessage("Message must be between 2 and 600 characters")
];

export const sendChatbotMessage = asyncHandler(async (req, res) => {
  const result = await answerFarmerQuestion({
    message: req.body.message,
    language: req.body.language,
    user: req.user
  });

  res.json({
    success: true,
    reply: result
  });
});
