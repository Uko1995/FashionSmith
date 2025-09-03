/**
 * Utility functions for handling image URLs
 */

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Convert a profile image path to a full URL
 * @param {string|null|undefined} imagePath - The image path from the database
 * @returns {string|null} - Full URL to the image or null if no image
 */
export const getProfileImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If it's already a full URL (starts with http), return as is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // If it's a Cloudinary URL (contains cloudinary.com), return as is
  if (imagePath.includes("cloudinary.com")) {
    return imagePath;
  }

  // If it's a relative path, prepend the API URL
  const fullUrl = imagePath.startsWith("/")
    ? `${API_URL}${imagePath}`
    : `${API_URL}/${imagePath}`;

  return fullUrl;
};

/**
 * Get user initials for fallback avatar
 * @param {object} user - User object
 * @returns {string} - User initials
 */
export const getUserInitials = (user) => {
  if (!user) return "";

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const username = user.username || "";

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  if (username) {
    return username.slice(0, 2).toUpperCase();
  }

  return "U";
};

/**
 * Check if an image URL is valid
 * @param {string} url - Image URL to check
 * @returns {Promise<boolean>} - Whether the image loads successfully
 */
export const isImageValid = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};
