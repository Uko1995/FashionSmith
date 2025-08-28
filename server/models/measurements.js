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
        TrouserWaist: {
          bsonType: "number",
          minimum: 0,
          description: "Trouser waist measurement in inches/cm",
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
        Bicep: {
          bsonType: "number",
          minimum: 0,
          description: "Bicep measurement in inches/cm",
        },
        AgbadaLength: {
          bsonType: "number",
          minimum: 0,
          description: "Agbada length measurement in inches/cm",
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
        agbadaLength: {
          bsonType: "number",
          minimum: 0,
          description: "Agbada length measurement in inches/cm",
        },
        waistCoatLength: {
          bsonType: "number",
          minimum: 0,
          description: "waist coat length measurement in inches/cm",
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
  TrouserWaist: "number",
  ThighWidth: "number",
  KneeWidth: "number",
  AnkleWidth: "number",
  unit: "inches | cm",
  createdAt: "Date",
  updatedAt: "Date",
  ShirtLength: "number",
  SuitChest: "number",
  SuitWaist: "number",
  agbadaLength: "number",
  waistCoatLength: "number",
};

// Default values
export const measurementDefaults = {
  unit: "inches",
  createdAt: () => new Date(),
  updatedAt: () => new Date(),
  // Set default values for all measurement fields to avoid MongoDB validation errors
  KaftanLength: 0,
  TrouserLength: 0,
  TrouserWaist: 0,
  SuitLength: 0,
  LongSleeve: 0,
  ShortSleeve: 0,
  MidSleeve: 0,
  ShortSleeveWidth: 0,
  ThighWidth: 0,
  KneeWidth: 0,
  AnkleWidth: 0,
  ShirtLength: 0,
  SuitChest: 0,
  SuitWaist: 0,
  agbadaLength: 0,
  waistCoatLength: 0,
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
    "TrouserWaist",
    "ThighWidth",
    "KneeWidth",
    "AnkleWidth",
    "ShirtLength",
    "SuitChest",
    "SuitWaist",
    "agbadaLength",
    "waistCoatLength",
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
  // Filter out undefined values from measurementData to prevent overriding defaults
  const cleanedData = Object.fromEntries(
    Object.entries(measurementData).filter(
      ([key, value]) => value !== undefined
    )
  );

  const result = {
    ...measurementDefaults,
    ...cleanedData,
    createdAt: measurementData.createdAt || new Date(),
    updatedAt: new Date(),
  };

  return result;
};
