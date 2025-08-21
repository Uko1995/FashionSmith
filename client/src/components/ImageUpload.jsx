import { useState, useRef } from "react";
import { UploadIcon, XIcon, StarIcon } from "@phosphor-icons/react";
import { adminAPI } from "../services/api";
import toast from "react-hot-toast";

const ImageUpload = ({
  productId,
  existingImages = [],
  onImagesUpdate,
  className = "",
}) => {
  const [uploading, setUploading] = useState(false);
  const [deletingImages, setDeletingImages] = useState(new Set());
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    setUploading(true);
    try {
      const response = await adminAPI.uploadFlexibleImages(productId, formData);
      console.log("image response:", response);

      // Show appropriate success message
      const message =
        files.length === 1
          ? "Image uploaded successfully!"
          : `${files.length} images uploaded successfully!`;
      toast.success(message);

      onImagesUpdate();
      fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imagePublicId) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    setDeletingImages((prev) => new Set(prev).add(imagePublicId));
    try {
      await adminAPI.deleteProductImage(productId, imagePublicId);
      onImagesUpdate();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image. Please try again.");
    } finally {
      setDeletingImages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(imagePublicId);
        return newSet;
      });
    }
  };

  const handleSetMainImage = async (imagePublicId) => {
    try {
      await adminAPI.setMainImage(productId, imagePublicId);
      onImagesUpdate();
    } catch (error) {
      console.error("Error setting main image:", error);
      toast.error("Failed to set main image. Please try again.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast.error("Please upload only image files.");
      return;
    }

    const formData = new FormData();
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    setUploading(true);
    adminAPI
      .uploadFlexibleImages(productId, formData)
      .then(() => {
        const message =
          imageFiles.length === 1
            ? "Image uploaded successfully!"
            : `${imageFiles.length} images uploaded successfully!`;
        toast.success(message);
        onImagesUpdate();
      })
      .catch((error) => {
        console.error("Error uploading images:", error);
        toast.error("Failed to upload images. Please try again.");
      })
      .finally(() => {
        setUploading(false);
      });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-base-300 rounded-lg p-6 text-center hover:border-primary transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <UploadIcon className="w-12 h-12 mx-auto mb-4 text-base-content/50" />
        <p className="text-base-content/70 mb-4">
          Drag and drop images here, or{" "}
          <button
            type="button"
            className="text-primary cursor-pointer hover:underline"
            onClick={() => fileInputRef.current?.click()}
          >
            browse files
          </button>
        </p>
        <p className="text-sm text-base-content/50">
          Supports: JPG, PNG, WebP (Max: 10MB each)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        {uploading && (
          <div className="mt-4 flex items-center justify-center">
            <div className="loading loading-spinner loading-sm"></div>
            <span className="ml-2 text-sm">Uploading...</span>
          </div>
        )}
      </div>

      {/* Existing Images */}
      {existingImages && existingImages.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">
            Product Images ({existingImages.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingImages.map((image) => (
              <div key={image.public_id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-base-200">
                  <img
                    src={image.url}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />

                  {/* Main Image Badge */}
                  {image.isMain && (
                    <div className="absolute top-2 left-2 bg-warning text-warning-content px-2 py-1 rounded text-xs font-semibold">
                      Main
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!image.isMain && (
                      <button
                        type="button"
                        onClick={() => handleSetMainImage(image.public_id)}
                        className="btn btn-sm btn-warning btn-circle"
                        title="Set as main image"
                      >
                        <StarIcon className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image.public_id)}
                      disabled={deletingImages.has(image.public_id)}
                      className="btn btn-sm btn-error btn-circle"
                      title="Delete image"
                    >
                      {deletingImages.has(image.public_id) ? (
                        <div className="loading loading-spinner loading-xs"></div>
                      ) : (
                        <XIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
