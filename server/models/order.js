// Order schema definition and validation for MongoDB native driver

export const orderSchema = {
  // JSON Schema for MongoDB validation
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "userId",
        "productId",
        "quantity",
        "selectedFabric",
        "selectedColor",
        "deliveryDate",
        "deliveryAddress",
        "measurements",
        "unit",
      ],
      properties: {
        userId: {
          bsonType: "objectId",
          description: "User ID is required",
        },
        productId: {
          bsonType: "objectId",
          description: "Product ID is required",
        },
        garment: {
          bsonType: "string",
          description: "Garment type (for reference, derived from product)",
        },
        quantity: {
          bsonType: "number",
          minimum: 1,
          description: "Quantity must be at least 1",
        },
        selectedFabric: {
          bsonType: "string",
          description: "Selected fabric name",
        },
        selectedColor: {
          bsonType: "string",
          description: "Selected color name",
        },
        sleeveType: {
          bsonType: "string",
          enum: ["shortSleeve", "longSleeve"],
          description: "Sleeve type for shirts (shortSleeve or longSleeve)",
        },
        price: {
          bsonType: "number",
          minimum: 0,
          description: "Unit price",
        },
        cost: {
          bsonType: "number",
          minimum: 0,
          description: "cost (price * quantity)",
        },
        orderDate: {
          bsonType: "date",
          description: "Order creation date",
        },
        deliveryDate: {
          bsonType: "date",
          description: "Expected delivery date",
        },
        status: {
          bsonType: "string",
          enum: [
            "Pending",
            "In Progress",
            "Ready",
            "Delivered",
            "Cancelled",
            "Failed",
          ],
          description: "Order status",
        },
        deliveryAddress: {
          bsonType: "string",
          description: "Delivery address",
        },
        measurements: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              name: {
                bsonType: "string",
                description: "Measurement name",
              },
              value: {
                bsonType: "number",
                minimum: 0,
                description: "Measurement value",
              },
            },
            required: ["name", "value"],
          },
          description: "Array of measurement objects with name and value",
        },
        username: {
          bsonType: "string",
          description: "Customer username for reference",
        },
        unit: {
          bsonType: "string",
          description: "Measurement unit (e.g., 'inches', 'cm')",
        },
        paymentStatus: {
          bsonType: "string",
          enum: ["Pending", "Paid", "Failed", "Refunded"],
          description: "Payment status",
        },
        notes: {
          bsonType: "string",
          description: "Additional notes or specifications",
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
export const orderIndexes = [
  { key: { userId: 1 } },
  { key: { status: 1 } },
  { key: { orderDate: -1 } },
  { key: { deliveryDate: 1 } },
  { key: { paymentStatus: 1 } },
  { key: { userId: 1, status: 1 } },
  { key: { createdAt: -1 } },
];

// TypeScript-like interface for documentation
export const OrderInterface = {
  _id: "ObjectId",
  userId: "ObjectId",
  productId: "ObjectId",
  garment: "string",
  quantity: "number",
  selectedFabric: "string",
  selectedColor: "string",
  sleeveType: "shortSleeve | longSleeve",
  price: "number",
  cost: "number",
  orderDate: "Date",
  deliveryDate: "Date",
  status: "Pending | In Progress | Ready | Delivered | Cancelled | Failed",
  deliveryAddress: "string",
  username: "string",
  paymentStatus: "Pending | Paid | Failed | Refunded",
  notes: "string",
  createdAt: "Date",
  updatedAt: "Date",
  measurements: "array",
  unit: "string",
};

// Default values
export const orderDefaults = {
  status: "Pending",
  paymentStatus: "Pending",
  orderDate: () => new Date(),
  createdAt: () => new Date(),
  updatedAt: () => new Date(),
};

// Enums for validation
export const orderStatuses = [
  "Pending",
  "In Progress",
  "Ready",
  "Delivered",
  "Cancelled",
  "Failed",
];
export const paymentStatuses = ["Pending", "Paid", "Failed", "Refunded"];

// Validation functions
export const validateOrder = (orderData) => {
  const errors = [];

  // Required fields
  const requiredFields = [
    "userId",
    "productId",
    "quantity",
    "selectedFabric",
    "selectedColor",
    "deliveryDate",
    "deliveryAddress",
    "measurements",
    "unit",
  ];
  requiredFields.forEach((field) => {
    if (!orderData[field]) {
      errors.push(`${field} is required`);
    }
  });

  // Validate selectedFabric
  if (orderData.selectedFabric) {
    if (
      !orderData.selectedFabric ||
      typeof orderData.selectedFabric !== "string"
    ) {
      errors.push("selectedFabric is required and must be a string");
    }
  }

  // Validate selectedColor
  if (orderData.selectedColor) {
    if (
      !orderData.selectedColor ||
      typeof orderData.selectedColor !== "string"
    ) {
      errors.push("selectedColor is required and must be a string");
    }
  }

  // Validate sleeveType (optional field)
  if (orderData.sleeveType) {
    if (typeof orderData.sleeveType !== "string") {
      errors.push("sleeveType must be a string");
    } else if (!["shortSleeve", "longSleeve"].includes(orderData.sleeveType)) {
      errors.push("sleeveType must be either 'shortSleeve' or 'longSleeve'");
    }
  }

  // Validate quantity
  if (
    orderData.quantity &&
    (typeof orderData.quantity !== "number" || orderData.quantity < 1)
  ) {
    errors.push("quantity must be a positive number");
  }

  // Validate status
  if (orderData.status && !orderStatuses.includes(orderData.status)) {
    errors.push(`status must be one of: ${orderStatuses.join(", ")}`);
  }

  // Validate payment status
  if (
    orderData.paymentStatus &&
    !paymentStatuses.includes(orderData.paymentStatus)
  ) {
    errors.push(`paymentStatus must be one of: ${paymentStatuses.join(", ")}`);
  }

  // Validate delivery date (must be in the future)
  if (orderData.deliveryDate) {
    const deliveryDate = new Date(orderData.deliveryDate);
    if (isNaN(deliveryDate.getTime()) || deliveryDate <= new Date()) {
      errors.push("deliveryDate must be a valid future date");
    }
  }

  // validate measurements
  if (orderData.measurements) {
    if (!Array.isArray(orderData.measurements)) {
      errors.push("measurements must be an array");
    } else {
      orderData.measurements.forEach((measurement, index) => {
        if (
          !measurement.name ||
          typeof measurement.name !== "string" ||
          !measurement.value ||
          typeof measurement.value !== "number" ||
          measurement.value <= 0
        ) {
          errors.push(
            `measurements[${index}] must have a valid name (string) and value (positive number)`
          );
        }
      });
    }
  }

  // validate unit
  if (orderData.unit && typeof orderData.unit !== "string") {
    errors.push("unit must be a string");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper function to prepare order data for insertion
export const prepareOrderData = (orderData) => {
  return {
    ...orderDefaults,
    ...orderData,
    orderDate: orderData.orderDate || new Date(),
    createdAt: orderData.createdAt || new Date(),
    updatedAt: new Date(),
    cost: orderData.cost,
  };
};
