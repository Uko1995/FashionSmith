import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
});

// Database and collections
export const db = client.db("fashionsmith");
export const collections = {
  users: db.collection("users"),
  products: db.collection("products"),
  orders: db.collection("orders"),
  measurements: db.collection("measurements"),
  userVerifications: db.collection("userVerifications"),
};

let isConnected = false;

export default async function connectDB() {
  try {
    if (isConnected) {
      console.log("Already connected to MongoDB");
      return;
    }

    // Connect the client to the server
    await client.connect();

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    isConnected = true;
    console.log("✅ Successfully connected to MongoDB Atlas!");

    // Create indexes for better performance
    await createIndexes();
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    isConnected = false;
    throw new Error("Failed to connect to the database");
  }
}

// Create database indexes for better performance
async function createIndexes() {
  try {
    // User indexes
    await collections.users.createIndex({ email: 1 }, { unique: true });
    await collections.users.createIndex({ refreshToken: 1 });

    // Product indexes
    await collections.products.createIndex({ category: 1, status: 1 });
    await collections.products.createIndex({ featured: 1, status: 1 });
    await collections.products.createIndex({ basePrice: 1 });
    await collections.products.createIndex({
      name: "text",
      description: "text",
    });

    // Order indexes
    await collections.orders.createIndex({ userId: 1 });
    await collections.orders.createIndex({ orderDate: -1 });

    console.log("✅ Database indexes created successfully");
  } catch (error) {
    console.log("⚠️  Index creation warning:", error.message);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await client.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    process.exit(1);
  }
});
