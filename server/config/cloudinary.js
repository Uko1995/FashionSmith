import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "fashionsmith/products", // Folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      { width: 800, height: 800, crop: "fill", quality: "auto" }, // Optimize images
    ],
    public_id: (req, file) => {
      // Generate unique filename
      const timestamp = Date.now();
      const originalName = file.originalname.split(".")[0];
      return `product_${timestamp}_${originalName}`;
    },
  },
});

// Configure multer for single image upload
export const uploadProductImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Configure multer for multiple images upload
export const uploadMultipleImages = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10, // Maximum 10 files at once
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Helper function to upload image from URL (for migration or bulk uploads)
export const uploadImageFromUrl = async (imageUrl, publicId) => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: "fashionsmith/products",
      public_id: publicId,
      transformation: [
        { width: 800, height: 800, crop: "fill", quality: "auto" },
      ],
    });
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};

// Helper function to delete image from Cloudinary
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
};

// Helper function to extract public_id from Cloudinary URL
export const extractPublicId = (cloudinaryUrl) => {
  if (!cloudinaryUrl) return null;

  const urlParts = cloudinaryUrl.split("/");
  const uploadIndex = urlParts.findIndex((part) => part === "upload");

  if (uploadIndex === -1) return null;

  // Extract everything after the version (if present) or after upload
  let pathAfterUpload = urlParts.slice(uploadIndex + 1);

  // Remove version if present (starts with 'v' followed by numbers)
  if (pathAfterUpload[0] && /^v\d+$/.test(pathAfterUpload[0])) {
    pathAfterUpload = pathAfterUpload.slice(1);
  }

  // Join the remaining parts and remove file extension
  const fullPath = pathAfterUpload.join("/");
  return fullPath.replace(/\.[^/.]+$/, ""); // Remove file extension
};

export default cloudinary;
