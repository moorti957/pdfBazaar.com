import express from "express";
import multer from "multer";
import path from "path";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ================= GET LOGGED-IN USER =================
// ⚠️ IMPORTANT: Ye route hamesha /:id se upar hona chahiye
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error("ME ROUTE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// ================= GET USER BY ID =================
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error("GET USER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ================= UPDATE USER =================
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { name, email, phone, address, role, plan } = req.body;

    const updateData = { name, email, phone, address, role };

    // 🔥 Allow plan update (admin or payment success)
    if (plan) {
      updateData.plan = plan;
    }

    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
