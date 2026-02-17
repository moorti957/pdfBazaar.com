import Subscription from "../models/Subscription.js";
import User from "../models/User.js";

// 🔥 ACTIVATE PLAN (Payment success ke baad call hoga)
export const activatePlan = async (req, res) => {
  try {
    const userId = req.user.id;   // ✅ FIXED
    const { planName, durationDays, amount } = req.body;

    if (!planName || !durationDays || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + Number(durationDays));

    // 🔁 Expire old plans
    await Subscription.updateMany(
      { userId, status: "active" },
      { status: "expired" }
    );

    // ✅ Create new subscription
    const subscription = await Subscription.create({
      userId,
      planName: planName.toLowerCase(),
      expiryDate: expiry,
      amount,
      status: "active"
    });

    // 🔥 USER PLAN AUTO UPDATE
    await User.findByIdAndUpdate(userId, {
      plan: planName.toLowerCase(),
      planExpiry: expiry,
      pdfDownloadCount: 0
    });

    res.json({
      success: true,
      message: "Plan activated successfully",
      subscription
    });

  } catch (error) {
    console.error("SUBSCRIPTION ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 🔥 GET LOGGED IN USER ACTIVE PLAN
export const getMyPlan = async (req, res) => {
  try {
    const userId = req.user.id;   // ✅ FIXED

    const plan = await Subscription.findOne({
      userId,
      status: "active",
      expiryDate: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      plan
    });

  } catch (error) {
    console.error("GET PLAN ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
