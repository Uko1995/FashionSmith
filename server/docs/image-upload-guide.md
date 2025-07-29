# Product Image Upload with Cloudinary

This document explains how to use the new product image upload functionality.

## Overview

- Images are uploaded to Cloudinary and optimized automatically
- Only image files (jpg, jpeg, png, gif, webp) are allowed
- Maximum file size: 5MB
- Images are automatically resized to 800x800 pixels
- Image URLs are stored in the database

## API Endpoints

### 1. Create Product with Image

**POST** `/api/products`

**Headers:**

- `Authorization: Bearer <token>` (Admin only)
- `Content-Type: multipart/form-data`

**Body (Form Data):**

```
image: [file] (optional)
name: "Product Name"
description: "Product Description"
price: "From ₦50,000"
basePrice: 50000
category: "Traditional" | "Formal" | "Casual" | "Corporate" | "Accessories"
type: "Product Type"
featured: true | false
available: true | false
fabrics: JSON string of fabric array
colors: JSON string of color array
sizes: JSON string of size array
tags: JSON string of tag array
makingTime: "2-3 weeks"
```

**Example Fabrics JSON:**

```json
[
  {
    "name": "Cotton",
    "price": 0,
    "available": true,
    "description": "High-quality cotton"
  },
  {
    "name": "Linen",
    "price": 8000,
    "available": true,
    "description": "Premium linen"
  }
]
```

**Example Colors JSON:**

```json
[
  {
    "name": "Royal Blue",
    "hex": "#1e40af",
    "available": true,
    "premium": false,
    "extraPrice": 0
  },
  {
    "name": "Gold",
    "hex": "#fbbf24",
    "available": true,
    "premium": true,
    "extraPrice": 3000
  }
]
```

### 2. Update Product with Image

**PUT** `/api/products/:id`

Same body format as create. Only include fields you want to update.
If you include an image, it will replace the old one.

### 3. Delete Product

**DELETE** `/api/products/:id`

This will also delete the associated image from Cloudinary.

## Frontend Usage Example

### Using JavaScript Fetch API:

```javascript
// Create a new product with image
const createProductWithImage = async (productData, imageFile) => {
  const formData = new FormData();

  // Add image file
  if (imageFile) {
    formData.append("image", imageFile);
  }

  // Add product data
  formData.append("name", productData.name);
  formData.append("description", productData.description);
  formData.append("price", productData.price);
  formData.append("basePrice", productData.basePrice);
  formData.append("category", productData.category);
  formData.append("type", productData.type);
  formData.append("featured", productData.featured);
  formData.append("available", productData.available);
  formData.append("fabrics", JSON.stringify(productData.fabrics));
  formData.append("colors", JSON.stringify(productData.colors));
  formData.append("sizes", JSON.stringify(productData.sizes));
  formData.append("tags", JSON.stringify(productData.tags));
  formData.append("makingTime", productData.makingTime);

  try {
    const response = await fetch("/api/products", {
      method: "POST",
      credentials: "include", // Include cookies for auth
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      console.log("Product created:", result.product);
      // The result.product.image will contain the Cloudinary URL
    } else {
      console.error("Error:", result.message);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
};
```

### Using React with a File Input:

```jsx
import React, { useState } from "react";

const ProductForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    basePrice: "",
    category: "Traditional",
    type: "",
    featured: false,
    available: true,
    fabrics: [],
    colors: [],
    sizes: [],
    tags: [],
    makingTime: "2-3 weeks",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();

    if (imageFile) {
      submitData.append("image", imageFile);
    }

    Object.keys(formData).forEach((key) => {
      if (Array.isArray(formData[key])) {
        submitData.append(key, JSON.stringify(formData[key]));
      } else {
        submitData.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        credentials: "include",
        body: submitData,
      });

      const result = await response.json();

      if (response.ok) {
        alert("Product created successfully!");
        // Reset form or redirect
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Error creating product");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
      />

      <input
        type="text"
        placeholder="Product Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      {/* Add other form fields */}

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Product"}
      </button>
    </form>
  );
};
```

## Testing with Postman

1. Set request type to **POST**
2. URL: `http://localhost:3000/api/products`
3. Go to **Authorization** tab → Type: **Bearer Token** → Add your admin JWT token
4. Go to **Body** tab → Select **form-data**
5. Add fields:
   - `image` (File) - Select image file
   - `name` (Text) - "Test Product"
   - `description` (Text) - "Test Description"
   - `price` (Text) - "From ₦25,000"
   - `basePrice` (Text) - "25000"
   - `category` (Text) - "Traditional"
   - `type` (Text) - "Test Type"
   - And other fields as needed

## Error Handling

Common error responses:

- `400`: Missing required fields, invalid file type, file too large
- `401`: Not authenticated
- `403`: Not authorized (admin only)
- `500`: Server error, upload failed

## Security Notes

- Only authenticated admin users can create/update/delete products
- File type validation prevents non-image uploads
- File size limit prevents large uploads
- Images are automatically optimized on Cloudinary
- Old images are automatically deleted when updated/removed
