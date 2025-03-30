import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();

app
  .listen(process.env.PORT, () => {
    console.log(`Server Running on Port: http://localhost:${process.env.PORT}`);
  })
  .on("error", (error) => {
    if (error === "EADDRINUSE") {
      console.log(`Port ${process.env.PORT} is already in use`);
    } else {
      console.error(error);
    }
  });
