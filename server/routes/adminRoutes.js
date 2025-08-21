import admin from "../controllers/adminController.js";
import express from "express";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

// All admin routes require JWT verification and admin role
router.get("/stats", verifyJWT, admin.isAdmin, admin.getDashboardStats);
router.get("/orders", verifyJWT, admin.isAdmin, admin.getAllOrders);
router.get("/users", verifyJWT, admin.isAdmin, admin.getUsers);
router.get("/users/:userId", verifyJWT, admin.isAdmin, admin.getUserDetails);
router.get("/products", verifyJWT, admin.isAdmin, admin.getProducts);
router.post("/products", verifyJWT, admin.isAdmin, admin.createProduct);

export default router;
