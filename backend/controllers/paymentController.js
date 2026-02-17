import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now()
    });

    res.json({
      success: true,
      order, // 🔥 FULL ORDER OBJECT
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (err) {
    console.error("RAZORPAY ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
