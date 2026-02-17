import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  planName: {
    type: String,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  razorpayOrderId: String,
  razorpayPaymentId: String,

  startDate: {
    type: Date,
    default: Date.now,
  },

  expiryDate: {
    type: Date,
    required: true,
  },

  status: {
    type: String,
    enum: ["active", "expired"],
    default: "active",
  }

}, { timestamps: true });

export default mongoose.model("Subscription", subscriptionSchema);
