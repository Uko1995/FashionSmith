import express from "express";
import * as productController from "../controllers/productController.js";
import {
  handleProductImageUpload,
  handleMultipleProductImagesUpload,
  handleFlexibleImageUpload,
} from "../middleware/imageUpload.js";
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
router.post(
  "/",
  verifyJWT,
  verifyAdmin,
  handleProductImageUpload,
  productController.createProduct
);
router.put(
  "/:id",
  verifyJWT,
  verifyAdmin,
  handleProductImageUpload,
  productController.updateProduct
);
router.delete("/:id", verifyJWT, verifyAdmin, productController.deleteProduct);

// Image management routes
router.post(
  "/:id/images",
  verifyJWT,
  verifyAdmin,
  handleMultipleProductImagesUpload,
  productController.uploadProductImages
);

// Flexible image upload route (handles both single and multiple)
router.post(
  "/:id/upload-images",
  verifyJWT,
  verifyAdmin,
  handleFlexibleImageUpload,
  productController.uploadFlexibleImages
);

router.delete(
  "/:id/images/:imagePublicId",
  verifyJWT,
  verifyAdmin,
  productController.deleteProductImage
);
router.patch(
  "/:id/images/:imagePublicId/main",
  verifyJWT,
  verifyAdmin,
  productController.setMainImage
);

// Protected routes (for order tracking)
router.patch("/:id/order", productController.incrementOrderCount);

export default router;
