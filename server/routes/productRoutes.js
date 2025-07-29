import express from "express";
import * as productController from "../controllers/productController.js";
import { handleProductImageUpload } from "../middleware/imageUpload.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const router = express.Router();

// Public routes
router.get("/", productController.getProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/search", productController.searchProducts);
router.get("/homepage", productController.getHomepageData);
router.get("/category/:category", productController.getProductsByCategory);
router.get("/:id", productController.getProductById);

// Protected routes (admin only)
router.post("/", verifyJWT, verifyAdmin, handleProductImageUpload, productController.createProduct);
router.put("/:id", verifyJWT, verifyAdmin, handleProductImageUpload, productController.updateProduct);
router.delete("/:id", verifyJWT, verifyAdmin, productController.deleteProduct);

// Protected routes (for order tracking)
router.patch("/:id/order", productController.incrementOrderCount);

export default router;
