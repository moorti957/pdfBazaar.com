import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ================= ENV SETUP =================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FORCE LOAD .env FROM BACKEND ROOT
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("ENV CHECK (RAZORPAY):", process.env.RAZORPAY_KEY_ID);

// ================= APP INIT =================
const app = express();

// ================= CORS =================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ================= BODY PARSER =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= UPLOADS DIR =================
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

// ================= DATABASE =================
import connectDB from "./config/database.js";
connectDB();

// ================= ROUTES =================
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import paymentRoutes from "./routes/payment.js";
import userRoutes from "./routes/userRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import downloadCheckRoutes from "./routes/download-check.js";
// import subscriptionRoutes from "./routes/subscriptionRoutes.";

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/payment", paymentRoutes);   // ✅ ONLY ONCE
app.use("/api/users", userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", pdfRoutes);
app.use('/api/download-check', downloadCheckRoutes);



// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running successfully 🚀",
    env: process.env.NODE_ENV || "development"
  });
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// ================= GLOBAL ERROR =================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📦 API Base: http://localhost:${PORT}/api`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
  console.log("=".repeat(60) + "\n");
});
