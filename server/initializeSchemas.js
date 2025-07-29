// Database schema initialization script
// This sets up collections with validation and indexes

import { client } from "./config/db.js";
import { userSchema, userIndexes } from "./models/user.js";
import { productSchema, productIndexes } from "./models/products.js";
import { orderSchema, orderIndexes } from "./models/order.js";
import {
  measurementSchema,
  measurementIndexes,
} from "./models/measurements.js";
import {
  userVerificationSchema,
  userVerificationIndexes,
} from "./models/userVerification.js";

const db = client.db("fashionsmith");

// Initialize collections with schema validation and indexes
export const initializeSchemas = async () => {
  console.log("🔧 Initializing database schemas...");

  try {
    // Create collections with validation
    await createCollectionWithValidation("users", userSchema, userIndexes);
    await createCollectionWithValidation(
      "products",
      productSchema,
      productIndexes
    );
    await createCollectionWithValidation("orders", orderSchema, orderIndexes);
    await createCollectionWithValidation(
      "measurements",
      measurementSchema,
      measurementIndexes
    );
    await createCollectionWithValidation(
      "userverifications",
      userVerificationSchema,
      userVerificationIndexes
    );

    console.log("✅ All schemas initialized successfully!");

    // Log collection info
    const collections = await db.listCollections().toArray();
    console.log(
      "📋 Available collections:",
      collections.map((c) => c.name)
    );
  } catch (error) {
    console.error("❌ Schema initialization failed:", error);
    throw error;
  }
};

// Helper function to create collection with validation and indexes
const createCollectionWithValidation = async (
  collectionName,
  schema,
  indexes
) => {
  try {
    // Check if collection exists
    const collections = await db
      .listCollections({ name: collectionName })
      .toArray();

    if (collections.length === 0) {
      // Create collection with validation
      console.log(`Creating collection: ${collectionName}`);
      await db.createCollection(collectionName, schema);
    } else {
      // Update validation rules for existing collection
      console.log(
        `Updating validation for existing collection: ${collectionName}`
      );
      await db.command({
        collMod: collectionName,
        validator: schema.validator,
      });
    }

    // Create indexes
    console.log(`Creating indexes for: ${collectionName}`);
    const collection = db.collection(collectionName);

    // Get existing indexes
    const existingIndexes = await collection.listIndexes().toArray();
    const existingIndexNames = existingIndexes.map((idx) => idx.name);

    for (const index of indexes) {
      try {
        // Generate the index name that MongoDB would create
        const indexName = Object.keys(index.key)
          .map((key) => `${key}_${index.key[key]}`)
          .join("_");

        // Check if index already exists
        if (existingIndexNames.includes(indexName)) {
          console.log(`✓ Index already exists: ${JSON.stringify(index.key)}`);
          continue;
        }

        await collection.createIndex(index.key, index);
        console.log(`✓ Index created: ${JSON.stringify(index.key)}`);
      } catch (indexError) {
        // Index might already exist or have conflicts, log but don't fail
        if (
          indexError.message.includes("already exists") ||
          indexError.message.includes("same name as the requested index")
        ) {
          console.log(`✓ Index already exists: ${JSON.stringify(index.key)}`);
        } else {
          console.warn(
            `⚠️  Index creation warning for ${collectionName}:`,
            indexError.message
          );
        }
      }
    }

    console.log(`✅ Collection ${collectionName} initialized`);
  } catch (error) {
    console.error(`❌ Failed to initialize ${collectionName}:`, error);
    throw error;
  }
};

// Seed some sample data (optional)
export const seedSampleData = async () => {
  console.log("🌱 Seeding sample data...");

  try {
    const productsCollection = db.collection("products");

    // Check if products already exist
    const existingProducts = await productsCollection.countDocuments();
    if (existingProducts > 0) {
      console.log("📊 Products already exist, skipping seed");
      return;
    }

    // Sample products
    const sampleProducts = [
      {
        name: "Classic Agbada",
        description:
          "Traditional Nigerian Agbada with intricate embroidery. Perfect for special occasions and cultural events.",
        price: "From ₦90,000",
        basePrice: 90000,
        category: "Traditional",
        type: "Agbada",
        featured: true,
        available: true,
        image: "/agbada.jpg",
        fabrics: [
          {
            name: "Cotton",
            price: 0,
            available: true,
            description: "High-quality cotton",
          },
          {
            name: "Linen",
            price: 8000,
            available: true,
            description: "Premium linen",
          },
          {
            name: "Ankara",
            price: 5000,
            available: true,
            description: "Traditional African print",
          },
          {
            name: "Senator",
            price: 12000,
            available: true,
            description: "Luxury senator material",
          },
        ],
        colors: [
          {
            name: "Royal Blue",
            hex: "#1e40af",
            available: true,
            premium: false,
            extraPrice: 0,
          },
          {
            name: "Gold",
            hex: "#fbbf24",
            available: true,
            premium: true,
            extraPrice: 3000,
          },
          {
            name: "White",
            hex: "#ffffff",
            available: true,
            premium: false,
            extraPrice: 0,
          },
          {
            name: "Burgundy",
            hex: "#7c2d12",
            available: true,
            premium: true,
            extraPrice: 2500,
          },
        ],
        sizes: ["M", "L", "XL", "XXL", "Custom"],
        tags: ["traditional", "agbada", "embroidery", "nigerian"],
        makingTime: "3-4 weeks",
        orderCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Business Suit",
        description:
          "Professional business suit tailored to perfection. Modern cut with attention to detail.",
        price: "From ₦85,000",
        basePrice: 85000,
        category: "Formal",
        type: "Suit",
        featured: true,
        available: true,
        image: "/suit.jpg",
        fabrics: [
          {
            name: "Cashmere",
            price: 25000,
            available: true,
            description: "Premium cashmere wool",
          },
          {
            name: "Cotton",
            price: 0,
            available: true,
            description: "High-quality cotton",
          },
          {
            name: "Linen",
            price: 8000,
            available: true,
            description: "Premium linen",
          },
        ],
        colors: [
          {
            name: "Navy Blue",
            hex: "#1e3a8a",
            available: true,
            premium: false,
            extraPrice: 0,
          },
          {
            name: "Charcoal Gray",
            hex: "#374151",
            available: true,
            premium: false,
            extraPrice: 0,
          },
          {
            name: "Black",
            hex: "#000000",
            available: true,
            premium: false,
            extraPrice: 0,
          },
          {
            name: "Pinstripe Navy",
            hex: "#1e3a8a",
            available: true,
            premium: true,
            extraPrice: 5000,
          },
        ],
        sizes: ["S", "M", "L", "XL", "Custom"],
        tags: ["business", "formal", "suit", "professional"],
        makingTime: "2-3 weeks",
        orderCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Casual Shirt",
        description:
          "Comfortable casual shirt for everyday wear. Available in various colors and patterns.",
        price: "From ₦15,000",
        basePrice: 15000,
        category: "Casual",
        type: "Shirt",
        featured: false,
        available: true,
        image: "/casual-shirt.webp",
        fabrics: [
          {
            name: "Cotton",
            price: 0,
            available: true,
            description:
              "Soft, breathable cotton fabric perfect for daily wear",
          },
          {
            name: "Linen",
            price: 3000,
            available: true,
            description: "Premium linen for a more sophisticated casual look",
          },
        ],
        colors: [
          {
            name: "White",
            hex: "#ffffff",
            available: true,
            premium: false,
            extraPrice: 0,
          },
          {
            name: "Light Blue",
            hex: "#add8e6",
            available: true,
            premium: false,
            extraPrice: 0,
          },
          {
            name: "Navy",
            hex: "#000080",
            available: true,
            premium: false,
            extraPrice: 0,
          },
          {
            name: "Checkered Pattern",
            hex: "#4169e1",
            available: true,
            premium: true,
            extraPrice: 2000,
          },
        ],
        sizes: ["S", "M", "L", "XL"],
        tags: ["casual", "shirt", "comfortable", "everyday"],
        makingTime: "1-2 weeks",
        orderCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await productsCollection.insertMany(sampleProducts);
    console.log(`✅ Inserted ${sampleProducts.length} sample products`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
};

// Run initialization (can be called from server startup)
export const setupDatabase = async () => {
  console.log("🚀 Setting up database...");
  await initializeSchemas();
  // Uncomment the line below if you want to seed sample data
  // await seedSampleData();
  console.log("🎉 Database setup complete!");
};

// Export for manual use
export { db };
