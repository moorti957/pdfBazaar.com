import express from "express";
import multer from "multer";
import path from "path";
import User from "../models/User.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 🔹 Only Image Upload (optional)
router.post("/profile", upload.single("image"), (req, res) => {
  res.json({
    success: true,
    image: `/uploads/${req.file.filename}`
  });
});

// 🔥 Profile + Image Update Together
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Profile update failed",
    });
  }
});

export default router;
