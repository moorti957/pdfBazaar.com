import express from "express";
import Subscription from "../models/Subscription.js";

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const totalPlans = await Subscription.countDocuments();

    res.json({
      success: true,
      totalSell: totalPlans,   // ab yaha total plans aayega
      totalOrders: totalPlans,
      totalRevenue: totalPlans // frontend me replace karenge
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
