import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 3000;

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
