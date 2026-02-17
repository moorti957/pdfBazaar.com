import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 
      'mongodb+srv://dipanshus:12345678907890@cluster0.x00hqa0.mongodb.net/pdf';
    
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB Atlas connected successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('🛑 Server cannot start without MongoDB connection!');
    process.exit(1);
  }
};

export default connectDB;