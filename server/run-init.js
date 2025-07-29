#!/usr/bin/env node
import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

// Now import the modules that depend on environment variables
import { setupDatabase, seedSampleData } from "./initializeSchemas.js";
import { client } from "./config/db.js";

async function runInitialization() {
  try {
    console.log("🚀 Starting database initialization...");
    console.log("📍 MongoDB URI:", process.env.MONGO_URI ? "Set" : "Not set");

    // Connect to MongoDB
    await client.connect();
    console.log("✅ Connected to MongoDB");

    // Setup database schemas
    await setupDatabase();

    // Seed sample data
    await seedSampleData();

    console.log("🎉 Database initialization completed successfully!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  } finally {
    // Close connection
    await client.close();
    console.log("📤 Database connection closed");
    process.exit(0);
  }
}

// Run the initialization
runInitialization();
