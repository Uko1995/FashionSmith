// Product schema definition and validation for MongoDB native driver

export const productSchema = {
  // JSON Schema for MongoDB validation
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "description", "price", "basePrice", "category"],
      properties: {
        name: {
          bsonType: "string",
          description: "Product name is required",
          maxLength: 200,
        },
        description: {
          bsonType: "string",
          description: "Product description is required",
          maxLength: 1000,
        },
        price: {
          bsonType: "string",
          description: "Display price (e.g., 'From ₦20,000')",
        },
        basePrice: {
          bsonType: "number",
          minimum: 0,
          description: "Base price for calculations",
        },
        category: {
          bsonType: "string",
          enum: [
            "Traditional Wear",
            "Formal Wear",
            "Casual Wear",
            "Suits",
            "Shirts",
            "Accessories",
            "Traditional",
            "Formal",
            "Casual",
            "Corporate",
          ],
          description: "Product category",
        },

        featured: {
          bsonType: "bool",
          description: "Whether product is featured",
        },
        available: {
          bsonType: "bool",
          description: "Whether product is available",
        },
        image: {
          bsonType: "string",
          description: "Product image URL/path (legacy field)",
        },
        images: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              public_id: {
                bsonType: "string",
                description: "Cloudinary public ID",
              },
              url: {
                bsonType: "string",
                description: "Image URL",
              },
              width: {
                bsonType: "number",
                description: "Image width in pixels",
              },
              height: {
                bsonType: "number",
                description: "Image height in pixels",
              },
              isMain: {
                bsonType: "bool",
                description: "Whether this is the main product image",
              },
            },
            required: ["public_id", "url"],
          },
          description: "Product images array with metadata",
        },
        sizes: {
          bsonType: "array",
          items: {
            bsonType: "string",
          },
          description: "Available size options",
        },
        tags: {
          bsonType: "array",
          items: {
            bsonType: "string",
          },
          description: "Product tags for search",
        },
        makingTime: {
          bsonType: "string",
          description: "Estimated making time (e.g., '2-3 weeks')",
        },
        orderCount: {
          bsonType: "number",
          minimum: 0,
          description: "Number of times this product has been ordered",
        },
        sleeveTypes: {
          bsonType: "array",
          items: {
            bsonType: "string",
            enum: ["shortSleeve", "longSleeve"],
          },
          description: "Available sleeve types for shirts",
        },
        createdAt: {
          bsonType: "date",
          description: "Creation timestamp",
        },
        updatedAt: {
          bsonType: "date",
          description: "Last update timestamp",
        },
      },
    },
  },
};

// Indexes for performance
export const productIndexes = [
  { key: { name: 1 } },
  { key: { category: 1 } },
  { key: { featured: 1 } },
  { key: { available: 1 } },
  { key: { basePrice: 1 } },
  { key: { createdAt: -1 } },
  { key: { category: 1, available: 1 } },
  { key: { featured: 1, available: 1 } },
  { key: { tags: 1 } }, // Individual field indexes instead of text search
];

// TypeScript-like interface for documentation
export const ProductInterface = {
  _id: "ObjectId",
  name: "string",
  description: "string",
  price: "string",
  basePrice: "number",
  category: "Traditional | Formal | Casual | Corporate | Accessories",
  featured: "boolean",
  available: "boolean",
  image: "string",
  sizes: "string[]",
  tags: "string[]",
  makingTime: "string",
  orderCount: "number",
  sleeveTypes: "('shortSleeve' | 'longSleeve')[]",
  createdAt: "Date",
  updatedAt: "Date",
};

// Default values
export const productDefaults = {
  featured: false,
  available: true,
  sizes: ["S", "M", "L", "XL", "XXL", "Custom"],
  tags: [],
  orderCount: 0,
  makingTime: "2-3 weeks",
  createdAt: () => new Date(),
  updatedAt: () => new Date(),
};

// Categories and types
export const productCategories = ["Traditional", "Formal", "Casual"];

export const traditionalTypes = ["Agbada", "Kaftan", "Dashiki", "Babariga"];

export const formalTypes = ["Suit", "Tuxedo", "Blazer", "Waistcoat"];

export const casualTypes = ["Shirt", "Polo", "T-Shirt", "Shorts"];

// Validation functions
export const validateProduct = (productData) => {
  const errors = [];

  if (!productData.name || typeof productData.name !== "string") {
    errors.push("name is required and must be a string");
  }

  if (!productData.description || typeof productData.description !== "string") {
    errors.push("description is required and must be a string");
  }

  if (!productData.price || typeof productData.price !== "string") {
    errors.push("price is required and must be a string");
  }

  if (typeof productData.basePrice !== "number" || productData.basePrice < 0) {
    errors.push("basePrice is required and must be a positive number");
  }

  if (
    !productData.category ||
    !productCategories.includes(productData.category)
  ) {
    errors.push(`category must be one of: ${productCategories.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper function to prepare product data for insertion
export const prepareProductData = (productData) => {
  return {
    ...productDefaults,
    ...productData,
    createdAt: productData.createdAt || new Date(),
    updatedAt: new Date(),
    name: productData.name?.trim(),
    description: productData.description?.trim(),
    tags: productData.tags || [],
  };
};
