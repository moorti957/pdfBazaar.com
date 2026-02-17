import express from "express";
import { downloadPdf } from "../controllers/pdfController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// 🔥 PDF DOWNLOAD CHECK ROUTE
router.post("/download-check", auth, downloadPdf);

export default router;
