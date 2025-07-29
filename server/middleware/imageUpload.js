import {
  uploadProductImage,
  deleteImageFromCloudinary,
  extractPublicId,
} from "../config/cloudinary.js";

// Middleware for handling single product image upload
export const uploadSingleProductImage = uploadProductImage.single("image");

// Middleware for handling multiple product images upload
export const uploadMultipleProductImages = uploadProductImage.array(
  "images",
  5
); // Max 5 images

// Middleware for handling product image upload with error handling
export const handleProductImageUpload = (req, res, next) => {
  uploadSingleProductImage(req, res, (err) => {
    if (err) {
      console.error("Image upload error:", err);

      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum size is 5MB.",
        });
      }

      if (err.message === "Only image files are allowed!") {
        return res.status(400).json({
          success: false,
          message: "Only image files (jpg, jpeg, png, gif, webp) are allowed.",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Image upload failed.",
        error: err.message,
      });
    }

    next();
  });
};

// Middleware for handling multiple product images with error handling
export const handleMultipleProductImagesUpload = (req, res, next) => {
  uploadMultipleProductImages(req, res, (err) => {
    if (err) {
      console.error("Multiple images upload error:", err);

      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message:
            "One or more files are too large. Maximum size is 5MB per file.",
        });
      }

      if (err.message === "Only image files are allowed!") {
        return res.status(400).json({
          success: false,
          message: "Only image files (jpg, jpeg, png, gif, webp) are allowed.",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Images upload failed.",
        error: err.message,
      });
    }

    next();
  });
};

// Helper function to delete old image when updating
export const deleteOldProductImage = async (imageUrl) => {
  try {
    if (imageUrl && imageUrl.includes("cloudinary.com")) {
      const publicId = extractPublicId(imageUrl);
      if (publicId) {
        await deleteImageFromCloudinary(publicId);
        console.log("Old image deleted from Cloudinary:", publicId);
      }
    }
  } catch (error) {
    console.error("Error deleting old image:", error);
    // Don't throw error as this shouldn't break the main operation
  }
};

export default {
  handleProductImageUpload,
  handleMultipleProductImagesUpload,
  deleteOldProductImage,
};
