// User verification schema definition and validation for MongoDB native driver

export const userVerificationSchema = {
  // JSON Schema for MongoDB validation
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "uniqueString", "expiresAt"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Valid email address is required",
        },
        uniqueString: {
          bsonType: "string",
          description: "Unique verification string",
        },
        createdAt: {
          bsonType: "date",
          description: "Creation timestamp",
        },
        expiresAt: {
          bsonType: "date",
          description: "Expiration timestamp",
        },
        type: {
          bsonType: "string",
          enum: ["email_verification", "password_reset"],
          description: "Type of verification",
        },
      },
    },
  },
};

// Indexes for performance
export const userVerificationIndexes = [
  { key: { email: 1 } },
  { key: { uniqueString: 1 }, unique: true },
  { key: { expiresAt: 1 }, expireAfterSeconds: 0 }, // TTL index - auto delete expired documents
  { key: { type: 1 } },
  { key: { createdAt: -1 } },
];

// TypeScript-like interface for documentation
export const UserVerificationInterface = {
  _id: "ObjectId",
  email: "string",
  uniqueString: "string",
  createdAt: "Date",
  expiresAt: "Date",
  type: "email_verification | password_reset",
};

// Default values
export const userVerificationDefaults = {
  type: "email_verification",
  createdAt: () => new Date(),
  // Default expiration: 1 hour from creation
  expiresAt: () => new Date(Date.now() + 60 * 60 * 1000),
};

// Validation functions
export const validateUserVerification = (verificationData) => {
  const errors = [];

  // Required fields
  if (!verificationData.email || typeof verificationData.email !== "string") {
    errors.push("email is required and must be a string");
  } else if (
    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
      verificationData.email
    )
  ) {
    errors.push("email must be a valid email address");
  }

  if (
    !verificationData.uniqueString ||
    typeof verificationData.uniqueString !== "string"
  ) {
    errors.push("uniqueString is required and must be a string");
  }

  if (
    !verificationData.expiresAt ||
    !(verificationData.expiresAt instanceof Date)
  ) {
    errors.push("expiresAt is required and must be a Date");
  }

  // Validate type
  if (
    verificationData.type &&
    !["email_verification", "password_reset"].includes(verificationData.type)
  ) {
    errors.push('type must be either "email_verification" or "password_reset"');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper function to prepare verification data for insertion
export const prepareUserVerificationData = (verificationData) => {
  return {
    ...userVerificationDefaults,
    ...verificationData,
    createdAt: verificationData.createdAt || new Date(),
    email: verificationData.email?.toLowerCase(),
  };
};

// Helper function to check if verification has expired
export const isExpired = (verificationDoc) => {
  return new Date() > new Date(verificationDoc.expiresAt);
};
