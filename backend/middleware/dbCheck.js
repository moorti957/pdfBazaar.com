import mongoose from "mongoose";

export const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection lost. Please try again later.'
    });
  }
  next();
};