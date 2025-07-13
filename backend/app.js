import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import session from "express-session";
import compression from "compression";
import helmet from "helmet";

const app = express();
dotenv.config();

//middlewares
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(
  compression({
    algorithm: "brotliCompress",
    threshold: 0,
  })
);
app.use(helmet());
app.use(
  session({
    secret: process.env.secret_key,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 + 3,
    },
  })
);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

//routes
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to FashionSmith API");
});

export default app;
