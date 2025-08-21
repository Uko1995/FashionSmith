import {
  uploadProductImage,
  uploadMultipleImages,
  deleteImageFromCloudinary,
  extractPublicId,
} from "../config/cloudinary.js";

// Middleware for handling single product image upload
export const uploadSingleProductImage = uploadProductImage.single("image");

// Middleware for handling multiple product images upload
export const uploadMultipleProductImages = uploadMultipleImages.array(
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
        message: `Images upload failed: ${err.message}`,
        error: error.message,
      });
    }

    next();
  });
};

// Flexible middleware that handles both single and multiple images
export const handleFlexibleImageUpload = (req, res, next) => {
  // Use the multiple images middleware as it can handle both single and multiple
  uploadMultipleProductImages(req, res, (err) => {
    if (err) {
      console.error("Flexible image upload error:", err);

      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum size is 5MB per file.",
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

    // Check if any files were uploaded
    if (!req.files || req.files.length === 0) {
      // No files uploaded, continue without error
      req.uploadedImages = [];
    } else {
      // Files uploaded successfully
      req.uploadedImages = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));
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
  handleFlexibleImageUpload,
  deleteOldProductImage,
};
