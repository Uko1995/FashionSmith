import { collections } from "../config/db.js";
import { ObjectId } from "mongodb";
import {
  validateProduct,
  prepareProductData,
  productDefaults,
} from "../models/products.js";
import { deleteOldProductImage } from "../middleware/imageUpload.js";

// Get all products with filtering and pagination
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      featured,
      status = "active",
      page = 1,
      limit = 12,
      sortBy = "createdAt",
      sortOrder = "desc",
      minPrice,
      maxPrice,
    } = req.query;

    const query = { status };

    // Add category filter
    if (category && category !== "All") {
      query.category = category;
    }

    // Add featured filter
    if (featured === "true") {
      query.featured = true;
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = parseInt(minPrice);
      if (maxPrice) query.basePrice.$lte = parseInt(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [products, totalCount] = await Promise.all([
      collections.products
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      collections.products.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { minPrice, maxPrice, featured, limit = 10 } = req.query;

    let query = {
      category,
      status: "active",
    };

    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = parseInt(minPrice);
      if (maxPrice) query.basePrice.$lte = parseInt(maxPrice);
    }

    if (featured === "true") {
      query.featured = true;
    }

    const products = await collections.products
      .find(query)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: products,
      count: products.length,
      category,
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await collections.products
      .find({
        featured: true,
        status: "active",
      })
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured products",
      error: error.message,
    });
  }
};

// Search products
export const searchProducts = async (req, res) => {
  try {
    const { q, category, maxPrice, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    let query = {
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
      status: "active",
    };

    if (category && category !== "All") {
      query.category = category;
    }
    if (maxPrice) {
      query.basePrice = { $lte: parseInt(maxPrice) };
    }

    const results = await collections.products
      .find(query)
      .limit(parseInt(limit))
      .sort({ featured: -1, createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: results,
      count: results.length,
      query: q,
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({
      success: false,
      message: "Error searching products",
      error: error.message,
    });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await collections.products.findOne({
      _id: new ObjectId(id),
      status: "active",
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

// Get homepage data (featured + categories)
export const getHomepageData = async (req, res) => {
  try {
    const [featured, traditional, formal, casual] = await Promise.all([
      collections.products
        .find({
          featured: true,
          status: "active",
        })
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray(),

      collections.products
        .find({
          category: "Traditional",
          status: "active",
        })
        .limit(4)
        .toArray(),

      collections.products
        .find({
          category: "Formal",
          status: "active",
        })
        .limit(4)
        .toArray(),

      collections.products
        .find({
          category: "Casual",
          status: "active",
        })
        .limit(4)
        .toArray(),
    ]);

    res.json({
      success: true,
      data: {
        featured,
        traditional,
        formal,
        casual,
      },
    });
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching homepage data",
      error: error.message,
    });
  }
};

// Increment order count (called when product is ordered)
export const incrementOrderCount = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const result = await collections.products.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { orderCount: 1 } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Order count updated successfully",
    });
  } catch (error) {
    console.error("Error updating order count:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order count",
      error: error.message,
    });
  }
};

// Create a new product with image upload
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      basePrice,
      category,
      type,
      featured = false,
      available = true,
      fabrics,
      colors,
      sizes,
      tags,
      makingTime,
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !basePrice || !category || !type) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, description, price, basePrice, category, type",
      });
    }

    // Parse JSON fields if they're strings (from form data)
    let parsedFabrics = fabrics;
    let parsedColors = colors;
    let parsedSizes = sizes;
    let parsedTags = tags;

    try {
      if (typeof fabrics === "string") parsedFabrics = JSON.parse(fabrics);
      if (typeof colors === "string") parsedColors = JSON.parse(colors);
      if (typeof sizes === "string") parsedSizes = JSON.parse(sizes);
      if (typeof tags === "string") parsedTags = JSON.parse(tags);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format in fabrics, colors, sizes, or tags",
      });
    }

    // Get image URL from uploaded file
    const imageUrl = req.file ? req.file.path : null;

    // Prepare product data
    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: price.trim(),
      basePrice: parseFloat(basePrice),
      category,
      type: type.trim(),
      featured: featured === "true" || featured === true,
      available: available === "true" || available === true,
      image: imageUrl,
      fabrics: parsedFabrics || productDefaults.fabrics,
      colors: parsedColors || productDefaults.colors,
      sizes: parsedSizes || ["S", "M", "L", "XL", "Custom"],
      tags: parsedTags || [],
      makingTime: makingTime || "2-3 weeks",
      orderCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validate product data
    const validation = validateProduct(productData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Product validation failed",
        errors: validation.errors,
      });
    }

    // Prepare and insert product
    const preparedProduct = prepareProductData(productData);
    const result = await collections.products.insertOne(preparedProduct);

    if (!result.insertedId) {
      return res.status(500).json({
        success: false,
        message: "Failed to create product",
      });
    }

    // Fetch the created product
    const createdProduct = await collections.products.findOne({
      _id: result.insertedId,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: createdProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// Update an existing product with optional image upload
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Get the existing product
    const existingProduct = await collections.products.findOne({
      _id: new ObjectId(id),
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      description,
      price,
      basePrice,
      category,
      type,
      featured,
      available,
      fabrics,
      colors,
      sizes,
      tags,
      makingTime,
    } = req.body;

    // Parse JSON fields if they're strings (from form data)
    let parsedFabrics = fabrics;
    let parsedColors = colors;
    let parsedSizes = sizes;
    let parsedTags = tags;

    try {
      if (typeof fabrics === "string") parsedFabrics = JSON.parse(fabrics);
      if (typeof colors === "string") parsedColors = JSON.parse(colors);
      if (typeof sizes === "string") parsedSizes = JSON.parse(sizes);
      if (typeof tags === "string") parsedTags = JSON.parse(tags);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format in fabrics, colors, sizes, or tags",
      });
    }

    // Prepare update data
    const updateData = {
      updatedAt: new Date(),
    };

    // Update fields only if provided
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price !== undefined) updateData.price = price.trim();
    if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
    if (category !== undefined) updateData.category = category;
    if (type !== undefined) updateData.type = type.trim();
    if (featured !== undefined)
      updateData.featured = featured === "true" || featured === true;
    if (available !== undefined)
      updateData.available = available === "true" || available === true;
    if (parsedFabrics !== undefined) updateData.fabrics = parsedFabrics;
    if (parsedColors !== undefined) updateData.colors = parsedColors;
    if (parsedSizes !== undefined) updateData.sizes = parsedSizes;
    if (parsedTags !== undefined) updateData.tags = parsedTags;
    if (makingTime !== undefined) updateData.makingTime = makingTime;

    // Handle image update
    if (req.file) {
      // Delete old image if it exists
      if (existingProduct.image) {
        await deleteOldProductImage(existingProduct.image);
      }

      // Set new image URL
      updateData.image = req.file.path;
    }

    // Validate updated data (merge with existing data for validation)
    const productDataForValidation = { ...existingProduct, ...updateData };
    const validation = validateProduct(productDataForValidation);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Product validation failed",
        errors: validation.errors,
      });
    }

    // Update the product
    const result = await collections.products.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Fetch the updated product
    const updatedProduct = await collections.products.findOne({
      _id: new ObjectId(id),
    });

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Get the product to delete its image
    const product = await collections.products.findOne({
      _id: new ObjectId(id),
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete image from Cloudinary
    if (product.image) {
      await deleteOldProductImage(product.image);
    }

    // Delete the product
    const result = await collections.products.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};
