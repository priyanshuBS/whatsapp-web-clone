import "dotenv/config";
import app from "./app";
import connectDB from "./config/database";

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION!! Shuting down...");
  console.log(err);
  process.exit(1);
});

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server is running on PORT: ${PORT}`);
    });

    process.on("unhandledRejection", (err) => {
      console.error("Unhandled Promise rejection ", err);
      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((error) => {
    console.error("Error!!! While connecting to MongoDB", error);
    process.exit(1);
  });
