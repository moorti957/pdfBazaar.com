import express from "express";
import { auth } from "../middleware/auth.js";
import { activatePlan, getMyPlan } from "../controllers/subscriptionController.js";

const router = express.Router();

// 🔥 Activate plan after payment success
router.post("/activate", auth, activatePlan);

// 🔥 Get current user active plan
router.get("/my-plan", auth, getMyPlan);

export default router;
