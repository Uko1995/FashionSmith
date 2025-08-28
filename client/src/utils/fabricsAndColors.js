// Frontend-only fabric and color configurations for the OrderModal

export const availableFabrics = [
  {
    name: "Cotton",
    description: "High-quality cotton fabric - comfortable and breathable",
    popular: true,
  },
  {
    name: "Linen",
    description: "Premium linen fabric - light and airy for formal wear",
    popular: true,
  },
  {
    name: "Ankara",
    description: "Traditional African print - vibrant and cultural",
    popular: true,
  },
  {
    name: "Cashmere",
    description: "Luxury senator material - soft and elegant",
    premium: true,
  },
  {
    name: "Silk",
    description: "Luxurious silk fabric - smooth and lustrous",
    premium: true,
  },
  {
    name: "Wool",
    description: "Premium wool fabric - warm and durable",
  },
  {
    name: "Denim",
    description: "Quality denim fabric - sturdy and versatile",
  },
  {
    name: "Satin",
    description: "Elegant satin fabric - glossy and formal",
    premium: true,
  },
];

export const availableColors = [
  {
    name: "Navy Blue",
    hex: "#1e3a8a",
    popular: true,
  },
  {
    name: "Black",
    hex: "#000000",
    popular: true,
  },
  {
    name: "White",
    hex: "#ffffff",
    popular: true,
  },
  {
    name: "Gray",
    hex: "#6b7280",
    popular: true,
  },
  {
    name: "Brown",
    hex: "#7c2d12",
  },
  {
    name: "Burgundy",
    hex: "#7c2d12",
    premium: true,
  },
  {
    name: "Royal Blue",
    hex: "#1e40af",
  },
  {
    name: "Forest Green",
    hex: "#166534",
  },
  {
    name: "Charcoal",
    hex: "#374151",
  },
  {
    name: "Maroon",
    hex: "#7f1d1d",
  },
  {
    name: "Cream",
    hex: "#fef3c7",
  },
  {
    name: "Deep Purple",
    hex: "#581c87",
    premium: true,
  },
  {
    name: "Gold",
    hex: "#d97706",
    premium: true,
  },
  {
    name: "Silver",
    hex: "#9ca3af",
    premium: true,
  },
];

// Helper function to get popular colors
export const getPopularColors = () => {
  return availableColors.filter((color) => color.popular);
};

// Helper function to get popular fabrics
export const getPopularFabrics = () => {
  return availableFabrics.filter((fabric) => fabric.popular);
};

// Helper function to get premium colors
export const getPremiumColors = () => {
  return availableColors.filter((color) => color.premium);
};

// Helper function to get premium fabrics
export const getPremiumFabrics = () => {
  return availableFabrics.filter((fabric) => fabric.premium);
};

// Helper function to calculate total extra cost
export const calculateExtraCost = (selectedColor, selectedFabric) => {
  const colorCost = selectedColor?.extraPrice || 0;
  const fabricCost = selectedFabric?.price || 0;
  return colorCost + fabricCost;
};
