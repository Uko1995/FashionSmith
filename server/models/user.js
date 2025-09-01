// User schema definition and validation for MongoDB native driver
export const userSchema = {
  // JSON Schema for MongoDB validation
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["firstName", "lastName", "email", "username", "role"],
      properties: {
        firstName: {
          bsonType: "string",
          description: "First name is required and must be a string",
          maxLength: 50,
        },
        lastName: {
          bsonType: "string",
          description: "Last name is required and must be a string",
          maxLength: 50,
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Email must be a valid email address",
        },
        password: {
          bsonType: ["string", "null"],
          minLength: 8,
          description:
            "Password must be at least 8 characters long (null for OAuth users)",
        },
        username: {
          bsonType: "string",
          description: "Username is required",
          maxLength: 100,
        },
        role: {
          bsonType: "string",
          enum: ["user", "admin"],
          description: "Role must be either user or admin",
        },
        createdAt: {
          bsonType: "date",
          description: "Creation timestamp",
        },
        isVerified: {
          bsonType: "bool",
          description: "Email verification status",
        },
        refreshToken: {
          bsonType: ["string", "null"],
          description: "JWT refresh token",
        },
        phoneNumber: {
          bsonType: ["string", "null"],
          description: "User's phone number",
        },
        address: {
          bsonType: ["object", "null"],
          properties: {
            street: {
              bsonType: ["string", "null"],
              description: "Street address",
            },
            state: {
              bsonType: ["string", "null"],
              description: "State or Province",
            },
            country: {
              bsonType: ["string", "null"],
              description: "Country",
            },
          },
          description: "User's address information",
        },
        profileImage: {
          bsonType: ["string", "null"],
          description: "User's profile image URL",
        },
        googleId: {
          bsonType: ["string", "null"],
          description: "Google OAuth ID for Google login users",
        },
        authProvider: {
          bsonType: ["string", "null"],
          enum: ["local", "google"],
          description: "Authentication provider used",
        },
        preferences: {
          bsonType: ["object", "null"],
          properties: {
            orderUpdates: {
              bsonType: ["bool", "null"],
              description: "Email notifications for order updates",
            },
            paymentNotifications: {
              bsonType: ["bool", "null"],
              description: "Email notifications for payments",
            },
            autoSaveReceipts: {
              bsonType: ["bool", "null"],
              description: "Automatically save receipts",
            },
            emailNotifications: {
              bsonType: ["bool", "null"],
              description: "General email notifications",
            },
            smsNotifications: {
              bsonType: ["bool", "null"],
              description: "SMS notifications",
            },
            marketingEmails: {
              bsonType: ["bool", "null"],
              description: "Marketing and promotional emails",
            },
            theme: {
              bsonType: ["string", "null"],
              enum: ["light", "dark", "auto"],
              description: "UI theme preference",
            },
            language: {
              bsonType: ["string", "null"],
              description: "Language preference",
            },
          },
          description: "User preferences and settings",
        },
      },
    },
  },
};

// Indexes for performance
export const userIndexes = [
  { key: { email: 1 }, unique: true },
  { key: { googleId: 1 }, sparse: true },
  { key: { refreshToken: 1 }, sparse: true },
  { key: { createdAt: 1 } },
  { key: { role: 1 } },
];

// TypeScript-like interface for documentation
export const UserInterface = {
  _id: "ObjectId",
  firstName: "string",
  lastName: "string",
  email: "string",
  password: "string | null",
  username: "string",
  role: "user | admin",
  createdAt: "Date",
  isVerified: "boolean",
  refreshToken: "string | null",
  phoneNumber: "string | null",
  address: {
    street: "string | null",
    state: "string | null",
    country: "string | null",
  },
  profileImage: "string | null",
  googleId: "string | null",
  authProvider: "local | google | null",
  preferences: {
    orderUpdates: "boolean | null",
    paymentNotifications: "boolean | null",
    autoSaveReceipts: "boolean | null",
    emailNotifications: "boolean | null",
    smsNotifications: "boolean | null",
    marketingEmails: "boolean | null",
    theme: "light | dark | auto | null",
    language: "string | null",
  },
};

// Default values
export const userDefaults = {
  role: "user",
  isVerified: false,
  refreshToken: null,
  phoneNumber: null,
  address: null,
  profileImage: null,
  googleId: null,
  authProvider: "local",
  password: null, // null for OAuth users
  preferences: {
    orderUpdates: true,
    paymentNotifications: true,
    autoSaveReceipts: true,
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    theme: "light",
    language: "en",
  },
  createdAt: () => new Date(),
};

// Validation functions
export const validateUser = (userData) => {
  const errors = [];

  if (!userData.firstName || typeof userData.firstName !== "string") {
    errors.push("firstName is required and must be a string");
  }

  if (!userData.lastName || typeof userData.lastName !== "string") {
    errors.push("lastName is required and must be a string");
  }

  if (!userData.email || typeof userData.email !== "string") {
    errors.push("email is required and must be a string");
  } else if (
    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userData.email)
  ) {
    errors.push("email must be a valid email address");
  }

  if (!userData.password || typeof userData.password !== "string") {
    errors.push("password is required and must be a string");
  } else if (userData.password.length < 8) {
    errors.push("password must be at least 8 characters long");
  }

  if (userData.role && !["user", "admin"].includes(userData.role)) {
    errors.push("role must be either user or admin");
  }

  // Validate phone number if provided
  if (userData.phoneNumber && typeof userData.phoneNumber !== "string") {
    errors.push("phoneNumber must be a string");
  } else if (
    userData.phoneNumber &&
    !/^\+234\s?\d{3}\s?\d{3}\s?\d{4}$/.test(userData.phoneNumber.trim())
  ) {
    errors.push(
      "phoneNumber must be a valid Nigerian phone number format (+234 123 456 7890)"
    );
  }

  // Validate address if provided
  if (userData.address && typeof userData.address !== "object") {
    errors.push("address must be an object");
  } else if (userData.address) {
    const addressFields = ["street", "state", "country"];
    addressFields.forEach((field) => {
      if (
        userData.address[field] &&
        typeof userData.address[field] !== "string"
      ) {
        errors.push(`address.${field} must be a string`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper function to prepare user data for insertion
export const prepareUserData = (userData) => {
  const prepared = {
    ...userDefaults,
    ...userData,
    createdAt: userData.createdAt || new Date(),
    email: userData.email?.toLowerCase(),
    firstName: userData.firstName?.trim(),
    lastName: userData.lastName?.trim(),
  };

  // Clean up phone number
  if (prepared.phoneNumber) {
    prepared.phoneNumber = prepared.phoneNumber.trim();
  }

  // Clean up address fields
  if (prepared.address) {
    const cleanAddress = {};
    Object.keys(prepared.address).forEach((key) => {
      if (prepared.address[key] && typeof prepared.address[key] === "string") {
        cleanAddress[key] = prepared.address[key].trim();
      }
    });
    prepared.address =
      Object.keys(cleanAddress).length > 0 ? cleanAddress : null;
  }

  return prepared;
};
