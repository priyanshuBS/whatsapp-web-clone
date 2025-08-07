import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const MONGODB_URI: string | undefined = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MongoDB URI is not defined in enivorment variables.");
    }

    const connectionInstance = await mongoose.connect(MONGODB_URI);
    console.log(
      `MongoDB connected successfully!!! HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("ERROR!!! While connecting to MongoDB.", error);
    process.exit(1);
  }
};

export default connectDB;
