import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: String,
  address: String,

  password: { type: String, required: true, minlength: 6 },

  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  avatar: { type: String, default: "" },

  // 🔥 ADD THIS SECTION
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: []
    }
  ],

  // 🔥 Subscription Plan System
  plan: {
    type: String,
    enum: ["free", "basic", "standard", "premium"],
    default: "free"
  },

  // 🔢 PDF Download Count
  pdfDownloadCount: {
    type: Number,
    default: 0
  },

  // ⏳ Plan Expiry Date
  planExpiry: {
    type: Date,
    default: null
  }

}, { timestamps: true });


// 🔐 Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 🔁 Compare password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);