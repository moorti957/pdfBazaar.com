import express from "express";
import Razorpay from "razorpay";
import auth from "../middleware/auth.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/create-order", auth, async (req, res) => {
  try {
    const { amount } = req.body;

    console.log("PAYMENT AMOUNT:", amount);
    console.log("RAZORPAY KEY:", process.env.RAZORPAY_KEY_ID);

    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paisa
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    console.log("ORDER CREATED:", order);

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID, // 🔥 MUST SEND TO FRONTEND
    });

  } catch (error) {
    console.error("RAZORPAY ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
