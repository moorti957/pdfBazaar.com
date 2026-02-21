import express from "express";
import User from "../models/User.js";   // path check करो
import authMiddleware from "../middleware/authMiddleware.js"; // path check करो

const router = express.Router();

/**
 * TOGGLE FAVORITE
 */
router.post("/toggle", authMiddleware, async (req, res) => {
  try {
    const { pdfId } = req.body;

    if (!pdfId) {
      return res.status(400).json({
        success: false,
        message: "PDF ID is required"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

if (!user.favorites) {
  user.favorites = [];
}

         const isAlreadyFavorite = user.favorites.includes(pdfId);

    if (isAlreadyFavorite) {
      user.favorites.pull(pdfId);
    } else {
      user.favorites.push(pdfId);
    }

    await user.save();

    res.json({
      success: true,
      favorites: user.favorites
    });

  } catch (error) {
    console.error("Favorite Toggle Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


router.get("/", authMiddleware, async (req, res) => {
  try {

    const user = await User.findById(req.user.id)
      .populate("favorites");   // 🔥 populate directly here

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      favorites: user.favorites || []
    });

  } catch (error) {
    console.error("Get Favorites Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

export default router;