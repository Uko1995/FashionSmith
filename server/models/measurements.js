// Measurement schema definition and validation for MongoDB native driver

export const measurementSchema = {
  // JSON Schema for MongoDB validation
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "Neck", "Shoulder", "Chest", "NaturalWaist", "Hip"],
      properties: {
        userId: {
          bsonType: "objectId",
          description: "User ID is required",
        },
        Neck: {
          bsonType: "number",
          minimum: 0,
          description: "Neck measurement in inches/cm",
        },
        Shoulder: {
          bsonType: "number",
          minimum: 0,
          description: "Shoulder measurement in inches/cm",
        },
        Chest: {
          bsonType: "number",
          minimum: 0,
          description: "Chest measurement in inches/cm",
        },
        NaturalWaist: {
          bsonType: "number",
          minimum: 0,
          description: "Natural waist measurement in inches/cm",
        },
        Hip: {
          bsonType: "number",
          minimum: 0,
          description: "Hip measurement in inches/cm",
        },
        KaftanLength: {
          bsonType: "number",
          minimum: 0,
          description: "Kaftan length measurement in inches/cm",
        },
        TrouserLength: {
          bsonType: "number",
          minimum: 0,
          description: "Trouser length measurement in inches/cm",
        },
        SuitLength: {
          bsonType: "number",
          minimum: 0,
          description: "Suit length measurement in inches/cm",
        },
        LongSleeve: {
          bsonType: "number",
          minimum: 0,
          description: "Long sleeve measurement in inches/cm",
        },
        ShortSleeve: {
          bsonType: "number",
          minimum: 0,
          description: "Short sleeve measurement in inches/cm",
        },
        MidSleeve: {
          bsonType: "number",
          minimum: 0,
          description: "Mid sleeve measurement in inches/cm",
        },
        ShortSleeveWidth: {
          bsonType: "number",
          minimum: 0,
          description: "Short sleeve width measurement in inches/cm",
        },
        ThighWidth: {
          bsonType: "number",
          minimum: 0,
          description: "Thigh width measurement in inches/cm",
        },
        KneeWidth: {
          bsonType: "number",
          minimum: 0,
          description: "Knee width measurement in inches/cm",
        },
        AnkleWidth: {
          bsonType: "number",
          minimum: 0,
          description: "Ankle width measurement in inches/cm",
        },
        unit: {
          bsonType: "string",
          enum: ["inches", "cm"],
          description: "Measurement unit",
        },
        createdAt: {
          bsonType: "date",
          description: "Creation timestamp",
        },
        updatedAt: {
          bsonType: "date",
          description: "Last update timestamp",
        },
        ShirtLength: {
          bsonType: "number",
          minimum: 0,
          description: "Shirt length measurement in inches/cm",
        },
        SuitChest: {
          bsonType: "number",
          minimum: 0,
          description: "Suit chest measurement in inches/cm",
        },
        SuitWaist: {
          bsonType: "number",
          minimum: 0,
          description: "Suit waist measurement in inches/cm",
        },
      },
    },
  },
};

// Indexes for performance
export const measurementIndexes = [
  { key: { userId: 1 }, unique: true }, // One measurement record per user
  { key: { createdAt: -1 } },
  { key: { updatedAt: -1 } },
];

// TypeScript-like interface for documentation
export const MeasurementInterface = {
  _id: "ObjectId",
  userId: "ObjectId",
  Neck: "number",
  Shoulder: "number",
  Chest: "number",
  NaturalWaist: "number",
  Hip: "number",
  KaftanLength: "number",
  SuitLength: "number",
  LongSleeve: "number",
  ShortSleeve: "number",
  MidSleeve: "number",
  ShortSleeveWidth: "number",
  TrouserLength: "number",
  ThighWidth: "number",
  KneeWidth: "number",
  AnkleWidth: "number",
  unit: "inches | cm",
  createdAt: "Date",
  updatedAt: "Date",
  ShirtLength: "number",
  SuitChest: "number",
  SuitWaist: "number",
};

// Default values
export const measurementDefaults = {
  unit: "inches",
  createdAt: () => new Date(),
  updatedAt: () => new Date(),
};

// Validation functions
export const validateMeasurement = (measurementData) => {
  const errors = [];

  const requiredFields = [
    "userId",
    "Neck",
    "Shoulder",
    "Chest",
    "NaturalWaist",
    "Hip",
    "TrouserLength",
  ];
  const numericFields = [
    "Neck",
    "Shoulder",
    "Chest",
    "NaturalWaist",
    "Hip",
    "KaftanLength",
    "SuitLength",
    "LongSleeve",
    "ShortSleeve",
    "MidSleeve",
    "ShortSleeveWidth",
    "TrouserLength",
    "ThighWidth",
    "KneeWidth",
    "AnkleWidth",
    "ShirtLength",
    "SuitChest",
    "SuitWaist",
  ];

  // Check required fields
  requiredFields.forEach((field) => {
    if (!measurementData[field]) {
      errors.push(`${field} is required`);
    }
  });

  // Check numeric fields
  numericFields.forEach((field) => {
    if (measurementData[field] !== undefined) {
      if (
        typeof measurementData[field] !== "number" ||
        measurementData[field] < 0
      ) {
        errors.push(`${field} must be a positive number`);
      }
    }
  });

  // Check unit
  if (
    measurementData.unit &&
    !["inches", "cm"].includes(measurementData.unit)
  ) {
    errors.push('unit must be either "inches" or "cm"');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper function to prepare measurement data for insertion
export const prepareMeasurementData = (measurementData) => {
  return {
    ...measurementDefaults,
    ...measurementData,
    createdAt: measurementData.createdAt || new Date(),
    updatedAt: new Date(),
  };
};
