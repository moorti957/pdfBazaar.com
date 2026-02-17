import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Customer from "../models/Customer.js";

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      phone,
      address,
      password,
      plan: "free",
      pdfDownloadCount: 0
    });

    // 🔥 CREATE CUSTOMER FOR ADMIN PANEL
    await Customer.create({
      name,
      email,
      phone,
      address,
      status: "active",
      totalOrders: 0,
      totalSpent: 0,
      lastActive: new Date()
    });

    // ✅ FIXED TOKEN PAYLOAD
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email aur password dono required hain"
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // ✅ FIXED TOKEN PAYLOAD
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR FULL:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};

// ================= CURRENT USER =================
export const getCurrentUser = async (req, res) => {
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
    console.error("GET CURRENT USER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
