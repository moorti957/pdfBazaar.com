import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Subscription from "../models/Subscription.js";
import PdfPurchase from "../models/PdfPurchase.js";

import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// ================= ADMIN PURCHASE LIST =================
router.get("/purchases", async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    const formatted = subscriptions.map(sub => ({
      id: sub._id,
      customerName: sub.userId?.name || "Unknown",
      email: sub.userId?.email || "N/A",
      planName: sub.planName,
      price: sub.amount,
      status: sub.status === "active" ? "Active" : "Expired",
      purchaseDate: sub.startDate.toISOString().slice(0,10),
      expiryDate: sub.expiryDate.toISOString().slice(0,10),
      paymentMethod: "Razorpay",
      userId: sub.userId?._id,
      features: getPlanFeatures(sub.planName)
    }));

    res.json({ success: true, purchases: formatted });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= PLAN FEATURES =================
function getPlanFeatures(plan) {
  switch (plan) {
    case "Basic":
      return ["Access to 5 PDFs", "Basic Support", "Free Updates"];
    case "Standard":
      return ["Access to 15 PDFs", "Priority Support", "Download Option"];
    case "Premium":
      return ["Unlimited PDFs", "24/7 Support", "Early Access"];
    default:
      return [];
  }
}

// ================= CREATE ORDER =================
// ================= CREATE ORDER =================
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    console.log("🔥 PDF PAYMENT ROUTE HIT");
    console.log("AMOUNT:", amount);
    console.log("KEY:", process.env.RAZORPAY_KEY_ID);

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID   // 🔥 THIS IS THE MISSING LINE
    });

  } catch (error) {
    console.error("RAZORPAY ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// ================= VERIFY & SAVE PAYMENT =================
router.post("/verify-pdf-payment", auth, async (req, res) => {
  try {
    console.log("🔥 PDF PAYMENT ROUTE HIT");
    console.log("BODY:", req.body);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      pdfId,
      pdfName,
      amount
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment fields"
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    // 🔥 MAIN FIX — USER ID SAFE ACCESS
    const userId = req.user.userId || req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID missing from token"
      });
    }

    const purchase = await PdfPurchase.create({
      userId: req.user.id, 
      pdfId,
      pdfName,
      amount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: "paid"
    });

    console.log("✅ PDF PAYMENT SAVED:", purchase._id);

    res.json({
      success: true,
      message: "PDF payment verified & saved",
      purchase
    });

  } catch (error) {
    console.error("Verify PDF Payment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


export default router;
