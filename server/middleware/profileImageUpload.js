import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary storage for profile images
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "fashionsmith/profiles", // Separate folder for profile images
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      { width: 300, height: 300, crop: "fill", quality: "auto", gravity: "face" }, // Square profile image
    ],
    public_id: (req, file) => {
      // Generate unique filename with user ID
      const timestamp = Date.now();
      const userId = req.user?.id || req.user?._id || 'user';
      return `profile_${userId}_${timestamp}`;
    },
  },
});

// Configure multer for profile image upload
export const uploadProfileImage = multer({
  storage: profileImageStorage,
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

// Helper function to delete old profile image from Cloudinary
export const deleteProfileImage = async (publicId) => {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting profile image from Cloudinary:", error);
    throw error;
  }
};

// Helper function to extract public_id from Cloudinary URL
export const extractPublicIdFromUrl = (cloudinaryUrl) => {
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
