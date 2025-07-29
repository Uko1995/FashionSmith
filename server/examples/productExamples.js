import { MongoClient } from 'mongodb';

// ==========================================
// EXAMPLES OF USING MONGODB ATLAS DIRECTLY
// ==========================================

// MongoDB Atlas connection
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('fashionsmith'); // Your database name
const productsCollection = db.collection('products');

// 1. GET PRODUCTS BY CATEGORY
// ==========================================

// Get all Traditional products
const getTraditionalProducts = async () => {
  try {
    const traditionalProducts = await productsCollection.find({ 
      category: "Traditional",
      status: "active"
    }).toArray();
    console.log("Traditional Products:", traditionalProducts);
    // Returns: Agbadas, Kaftans, etc.
  } catch (error) {
    console.error("Error fetching traditional products:", error);
  }
};

// Get all Formal products
const getFormalProducts = async () => {
  try {
    const formalProducts = await productsCollection.find({ 
      category: "Formal",
      status: "active"
    }).toArray();
    console.log("Formal Products:", formalProducts);
    // Returns: Tailored Suits, Custom Shirts, Waistcoats, etc.
  } catch (error) {
    console.error("Error fetching formal products:", error);
  }
};

// Get Casual products with additional filtering
const getCasualProductsWithOptions = async () => {
  try {
    const casualProducts = await productsCollection.find({
      category: "Casual",
      status: "active",
      basePrice: { $lte: 25000 }, // Products under ₦25,000
      featured: true
    }).toArray();
    console.log("Featured Casual Products under ₦25,000:", casualProducts);
  } catch (error) {
    console.error("Error fetching casual products:", error);
  }
};

// 2. GET FEATURED PRODUCTS
// ==========================================

// Get default 10 featured products
const getFeaturedProducts = async () => {
  try {
    const featured = await productsCollection.find({
      featured: true,
      status: "active"
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();
    console.log("Featured Products (10):", featured);
    // Returns: Latest 10 featured products sorted by creation date
  } catch (error) {
    console.error("Error fetching featured products:", error);
  }
};

// Get only 5 featured products
const getFewFeaturedProducts = async () => {
  try {
    const featured = await productsCollection.find({
      featured: true,
      status: "active"
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();
    console.log("Top 5 Featured Products:", featured);
    // Returns: Latest 5 featured products
  } catch (error) {
    console.error("Error fetching featured products:", error);
  }
};

// 3. SEARCH PRODUCTS
// ==========================================

// Search for shirt products
const searchShirts = async () => {
  try {
    const shirts = await productsCollection.find({
      $or: [
        { name: { $regex: "shirt", $options: "i" } },
        { description: { $regex: "shirt", $options: "i" } }
      ],
      status: "active"
    }).toArray();
    console.log("Shirt Products:", shirts);
    // Returns: Custom Shirts, Casual Shirts, etc.
  } catch (error) {
    console.error("Error searching for shirts:", error);
  }
};

// Search for traditional wear
const searchTraditionalWear = async () => {
  try {
    const traditional = await productsCollection.find({
      $or: [
        { name: { $regex: "agbada", $options: "i" } },
        { description: { $regex: "agbada", $options: "i" } }
      ],
      status: "active"
    }).toArray();
    console.log("Agbada Products:", traditional);
    // Returns: Royal Agbadas and any products with "agbada" in name/description
  } catch (error) {
    console.error("Error searching for agbada:", error);
  }
};

// Search with additional options
const searchWithPriceFilter = async () => {
  try {
    const affordableProducts = await productsCollection.find({
      $or: [
        { name: { $regex: "tailored", $options: "i" } },
        { description: { $regex: "tailored", $options: "i" } }
      ],
      status: "active",
      basePrice: { $lte: 30000 } // Under ₦30,000
    }).toArray();
    console.log("Affordable Tailored Products:", affordableProducts);
  } catch (error) {
    console.error("Error searching with price filter:", error);
  }
};

// 4. COMBINED USAGE EXAMPLES
// ==========================================

// Get products for homepage display
const getHomepageProducts = async () => {
  try {
    // Get featured products for hero section
    const featuredProducts = await productsCollection.find({
      featured: true,
      status: "active"
    })
    .sort({ createdAt: -1 })
    .limit(6)
    .toArray();
    
    // Get products by categories for sections
    const traditionalProducts = await productsCollection.find({ 
      category: "Traditional",
      status: "active",
      featured: true 
    }).toArray();
    
    const formalProducts = await productsCollection.find({
      category: "Formal",
      status: "active"
    })
    .limit(4)
    .toArray();
    
    const casualProducts = await productsCollection.find({
      category: "Casual",
      status: "active"
    })
    .limit(4)
    .toArray();
    
    return {
      featured: featuredProducts,
      traditional: traditionalProducts,
      formal: formalProducts,
      casual: casualProducts
    };
  } catch (error) {
    console.error("Error fetching homepage products:", error);
  }
};

// Search functionality for frontend
const handleProductSearch = async (searchTerm, category = null, maxPrice = null) => {
  try {
    let query = {
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } }
      ],
      status: "active"
    };
    
    // Add price filter if specified
    if (maxPrice) {
      query.basePrice = { $lte: maxPrice };
    }
    
    // Add category filter if specified
    if (category && category !== "All") {
      query.category = category;
    }
    
    const results = await productsCollection.find(query).toArray();
    console.log(`Search results for "${searchTerm}":`, results);
    return results;
  } catch (error) {
    console.error("Error in product search:", error);
  }
};

// 5. INSTANCE METHOD EXAMPLE
// ==========================================

// Increment order count when product is ordered
const processProductOrder = async (productId) => {
  try {
    const result = await productsCollection.updateOne(
      { _id: new ObjectId(productId) },
      { $inc: { orderCount: 1 } }
    );
    
    if (result.modifiedCount > 0) {
      const product = await productsCollection.findOne({ _id: new ObjectId(productId) });
      console.log(`Order count updated for ${product.name}: ${product.orderCount}`);
    }
  } catch (error) {
    console.error("Error processing product order:", error);
  }
};

// 6. REAL-WORLD USAGE IN CONTROLLERS
// ==========================================

import { ObjectId } from 'mongodb';

// Controller function for product listing page
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { minPrice, maxPrice, featured } = req.query;
    
    let query = {
      category,
      status: "active"
    };
    
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = parseInt(minPrice);
      if (maxPrice) query.basePrice.$lte = parseInt(maxPrice);
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    const products = await productsCollection.find(query).toArray();
    
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message
    });
  }
};

// Controller function for search
export const searchProducts = async (req, res) => {
  try {
    const { q, category, maxPrice } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }
    
    let query = {
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } }
      ],
      status: "active"
    };
    
    if (category && category !== "All") {
      query.category = category;
    }
    if (maxPrice) {
      query.basePrice = { $lte: parseInt(maxPrice) };
    }
    
    const results = await productsCollection.find(query).toArray();
    
    res.json({
      success: true,
      data: results,
      count: results.length,
      query: q
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching products",
      error: error.message
    });
  }
};

// Controller function for homepage
export const getHomepageData = async (req, res) => {
  try {
    const featured = await productsCollection.find({
      featured: true,
      status: "active"
    })
    .sort({ createdAt: -1 })
    .limit(6)
    .toArray();
    
    const traditional = await productsCollection.find({
      category: "Traditional",
      status: "active",
      featured: true
    }).toArray();
    
    const formal = await productsCollection.find({
      category: "Formal",
      status: "active"
    })
    .limit(4)
    .toArray();
    
    const casual = await productsCollection.find({
      category: "Casual",
      status: "active"
    })
    .limit(4)
    .toArray();
    
    res.json({
      success: true,
      data: {
        featured,
        traditional,
        formal,
        casual
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching homepage data",
      error: error.message
    });
  }
};

// 7. FRONTEND INTEGRATION EXAMPLES
// ==========================================

// Example API calls from frontend
const apiExamples = {
  // Get all traditional products
  getTraditional: () => fetch('/api/products/category/Traditional'),
  
  // Get featured products
  getFeatured: () => fetch('/api/products/featured'),
  
  // Search products
  search: (query) => fetch(`/api/products/search?q=${encodeURIComponent(query)}`),
  
  // Filter by category and price
  filterProducts: (category, maxPrice) => 
    fetch(`/api/products/category/${category}?maxPrice=${maxPrice}`),
  
  // Search with filters
  searchWithFilters: (query, category, maxPrice) => 
    fetch(`/api/products/search?q=${encodeURIComponent(query)}&category=${category}&maxPrice=${maxPrice}`)
};

// Example usage in React component
const useProductsExample = `
// In your React component
import { useState, useEffect } from 'react';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Using the static method via API
        const response = await fetch('/api/products/category/Traditional');
        const data = await response.json();
        setProducts(data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {products.map(product => (
            <div key={product._id}>
              <h3>{product.name}</h3>
              <p>{product.price}</p>
              <span>{product.category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
`;

console.log("Product Static Methods Examples Created!");
console.log("Use these examples to implement product functionality in your FashionSmith app!");
