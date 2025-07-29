import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

//connect to the database
connectDB();

app
  .listen(PORT, () => {
    console.log(`Server Running on: http://localhost:${PORT}`);
  })
  .on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.log(`Port ${PORT} is already in use`);
    } else {
      console.error(error);
    }
  });
