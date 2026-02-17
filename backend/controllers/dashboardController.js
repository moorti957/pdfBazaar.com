import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Subscription from "../models/Subscription.js";

// ================= DASHBOARD STATS =================
export const getDashboardStats = async (req, res) => {
  try {
    // ---------- PRODUCT ----------
    const totalProducts = await Product.countDocuments();

    // ---------- CUSTOMER ----------
    const totalCustomers = await Customer.countDocuments();

    // ---------- PRODUCT ORDERS ----------
    const productOrders = await Order.countDocuments();

    const productRevenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const productRevenue = productRevenueAgg[0]?.total || 0;

    // ---------- PLAN (SUBSCRIPTIONS) ----------
    const totalPlans = await Subscription.countDocuments();

    const planRevenueAgg = await Subscription.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const planRevenue = planRevenueAgg[0]?.total || 0;

    // ---------- FINAL TOTAL ----------
    const totalOrders = productOrders + totalPlans;
    const totalSell = totalPlans;
    const totalRevenue = productRevenue + planRevenue;

    res.json({
      success: true,
      totalProducts,
      totalCustomers,
      totalOrders,
      totalSell,
      totalPlans,
      totalRevenue
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
