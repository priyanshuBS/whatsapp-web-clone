import mongoose from "mongoose";

async function connectDB() {
  try {
    const mongoInstance = await mongoose.connect(process.env.MONGODB_URI);
    console.log(
      `Connect to MongoDB successfully!!! HOST: ${mongoInstance.connection.host}`
    );
  } catch (error) {
    console.error("ERROR!!! While connecting to MongoDB.", error);
    process.exit(1);
  }
}

export default connectDB;
