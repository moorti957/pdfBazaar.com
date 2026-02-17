import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import { getDownloadLimit } from "../utils/plan.js";

export const downloadPdf = async (req, res) => {
  try {
    const userId = req.user.id;

    // 🔥 Active subscription check
    const activePlan = await Subscription.findOne({
      userId,
      status: "active",
      expiryDate: { $gt: new Date() }
    });

    if (!activePlan) {
      return res.status(403).json({
        success: false,
        message: "No active subscription found"
      });
    }

    const user = await User.findById(userId);

    const limit = getDownloadLimit(user.plan);

    if (user.pdfDownloadCount >= limit) {
      return res.status(403).json({
        success: false,
        message: "Download limit exceeded"
      });
    }

    user.pdfDownloadCount += 1;
    await user.save();

    res.json({
      success: true,
      message: "Download allowed"
    });

  } catch (error) {
    console.error("PDF DOWNLOAD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
