import express from "express";
import { uploadDocument, listDocuments, getDocumentPreview, deleteDocument } from "../controllers/documentController.js";
import { authenticate, authenticatePreview } from "../middleware/auth.js";

export const documentRouter = express.Router();

documentRouter.use(authenticate);
documentRouter.post("/upload", uploadDocument);
documentRouter.get("/", listDocuments);
documentRouter.delete("/:id", deleteDocument);

// Preview uses special middleware that also reads token from ?token= query param (for iframes)
documentRouter.get("/:id/preview", authenticatePreview, getDocumentPreview);
