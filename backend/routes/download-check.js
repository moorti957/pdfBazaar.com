import express from "express";
import {auth} from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// Check if user can download
router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    switch (user.plan) {
      case "premium":
        return res.json({
          success: true,
          message: "Download allowed",
          plan: user.plan,
          downloadCount: user.pdfDownloadCount
        });

      case "basic":
        if (user.pdfDownloadCount >= 5) {
          return res.status(403).json({
            success: false,
            message: "Basic plan limit reached (5 downloads). Upgrade to continue.",
            plan: user.plan,
            downloadCount: user.pdfDownloadCount,
            limit: 5
          });
        }
        break;

      case "standard":
        if (user.pdfDownloadCount >= 15) {
          return res.status(403).json({
            success: false,
            message: "Standard plan limit reached (15 downloads). Upgrade to continue.",
            plan: user.plan,
            downloadCount: user.pdfDownloadCount,
            limit: 15
          });
        }
        break;

      case "free":
      default:
        if (user.pdfDownloadCount >= 2) {
          return res.status(403).json({
            success: false,
            message: "Free plan limit reached (2 downloads). Upgrade to continue.",
            plan: user.plan,
            downloadCount: user.pdfDownloadCount,
            limit: 2
          });
        }
        break;
    }

    return res.json({
      success: true,
      message: "Download allowed",
      plan: user.plan,
      downloadCount: user.pdfDownloadCount
    });

  } catch (error) {
    console.error("Download check error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Increment download count
router.post("/increment", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.pdfDownloadCount = (user.pdfDownloadCount || 0) + 1;
    await user.save();

    return res.json({
      success: true,
      message: "Download count updated",
      downloadCount: user.pdfDownloadCount
    });

  } catch (error) {
    console.error("Increment download error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

export default router;
