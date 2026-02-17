import mongoose from "mongoose";

const pdfPurchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  pdfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  pdfName: String,
  amount: Number,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  status: {
    type: String,
    default: "paid"
  }
}, { timestamps: true });

export default mongoose.model("PdfPurchase", pdfPurchaseSchema);
