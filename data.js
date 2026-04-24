/**
 * ============================================
 * ZIGZEX MART - Product Catalog & Mock APIs
 * Block 3: data.js
 * ============================================
 */

// --- 1. PRODUCT GENERATOR CONFIGURATION --- //

const categories = ['Electronics', 'Fashion', 'Home', 'Accessories'];

const brandMap = {
    'Electronics': ['Apple', 'Samsung', 'Sony', 'Dell', 'HP', 'Asus', 'OnePlus'],
    'Fashion': ['Nike', 'Adidas', 'Puma', 'Zara', 'Levi\'s', 'H&M', 'Allen Solly'],
    'Home': ['IKEA', 'Bombay Dyeing', 'HomeTown', 'Prestige', 'Philips', 'Godrej'],
    'Accessories': ['Fastrack', 'Ray-Ban', 'Titan', 'Fossil', 'Casio', 'Daniel Wellington']
};

// High-quality Unsplash placeholders mapped to categories
const imageMap = {
    'Electronics': [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80', // Phone
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80', // Laptop
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', // Headphones
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80', // Watch
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80', // Earbuds
        'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&q=80'  // PC setup
    ],
    'Fashion': [
        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&q=80', // Pattern Shirt
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80', // Denim
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80', // Shoes
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80', // Hoodie
        'https://images.unsplash.com/photo-1596755094514-f87e32f85ceb?w=600&q=80', // T-Shirt
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80'  // Jacket
    ],
    'Home': [
        'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&q=80', // Sofa
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80', // Room decor
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&q=80', // Furniture
        'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600&q=80', // Lamp
        'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&q=80', // Coffee table
        'https://images.unsplash.com/photo-1583847268964-b28ce8fca921?w=600&q=80'  // Plant decor
    ],
    'Accessories': [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80', // Sunglasses
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', // Bag
        'https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&q=80', // Wallet
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80', // Belt
        'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80', // Classic Watch
        'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600&q=80'  // Jewelry
    ]
};

const productNames = {
    'Electronics': ['Pro Smartphone 5G', 'Ultra Slimbook 15"', 'Noise Cancelling Headphones', 'Smart Fitness Watch', 'Wireless Earbuds Pro', 'Gaming Monitor 4K', 'Mechanical Keyboard', 'Power Bank 20000mAh', 'Bluetooth Speaker Base', 'Tablet Pro 11"'],
    'Fashion': ['Classic Cotton Shirt', 'Slim Fit Denim Jeans', 'Running Sneakers', 'Winter Fleece Hoodie', 'Casual Polo T-Shirt', 'Formal Chinos', 'Leather Biker Jacket', 'Sports Trackpants', 'Urban Bomber Jacket', 'Knitted Sweater'],
    'Home': ['Modern Fabric Sofa', 'Abstract Wall Art', 'Minimalist Coffee Table', 'Smart LED Floor Lamp', 'Luxury Bed Linens', 'Ceramic Vase Set', 'Ergonomic Office Chair', 'Dining Table Set', 'Aroma Diffuser', 'Velvet Cushion Set'],
    'Accessories': ['Aviator Sunglasses', 'Premium Leather Wallet', 'Vintage Messenger Bag', 'Classic Buckle Belt', 'Analog Wrist Watch', 'Travel Duffle Bag', 'UV Protection Glasses', 'Woven Bracelet', 'Chronograph Watch', 'Card Holder']
};

// Helper: Random Integer
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper: Random Array Item
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- 2. GENERATE 100 MOCK PRODUCTS --- //
const generateCatalog = () => {
    const catalog = [];
    
    // Generate exactly 100 products
    for (let i = 1; i <= 100; i++) {
        // Distribute categories evenly (25 of each)
        const category = categories[i % 4]; 
        const brand = getRandomItem(brandMap[category]);
        const baseName = getRandomItem(productNames[category]);
        const image = getRandomItem(imageMap[category]);
        
        // Generate realistic Indian Pricing (₹) based on category
        let basePrice;
        if (category === 'Electronics') basePrice = getRandomInt(1500, 95000);
        else if (category === 'Fashion') basePrice = getRandomInt(499, 5500);
        else if (category === 'Home') basePrice = getRandomInt(999, 35000);
        else basePrice = getRandomInt(299, 4500);
        
        // Apply random discount between 5% and 65%
        const discountPercent = getRandomInt(5, 65);
        // Reverse calculate original price and round to nearest 10 for clean Indian pricing (e.g. 990, 1490)
        const originalPrice = Math.ceil((basePrice / (1 - (discountPercent / 100))) / 10) * 10 - 1; 
        const currentPrice = Math.floor(basePrice / 10) * 10 - 1; // E.g., Ends in 9 (999, 1499)
        
        // Generate mock ratings (Biased towards positive for better UI feel)
        const rating = (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1);
        const reviewsCount = getRandomInt(12, 2450);
        
        const isNew = i < 15; // First 14 items marked as new arrivals
        
        catalog.push({
            id: `PROD-${1000 + i}`,
            name: `${brand} ${baseName} - ${getRandomInt(2024, 2026)} Edition`,
            category: category,
            brand: brand,
            originalPrice: originalPrice,
            currentPrice: currentPrice,
            discount: discountPercent,
            image: image,
            rating: parseFloat(rating),
            reviews: reviewsCount,
            isNew: isNew,
            description: `Experience the premium quality of the ${brand} ${baseName}. Expertly crafted for the Indian market, combining modern aesthetics with exceptional durability. Whether for professional use or everyday lifestyle, this product ensures top-tier performance and style.`,
            features: [
                'Premium build quality & materials',
                '1 Year Official Brand Warranty',
                '100% Authentic & Verified Product',
                '7 Days Easy Return & Replacement',
                'Free Express Delivery'
            ],
            // Random past date for sorting
            addedDate: new Date(Date.now() - getRandomInt(0, 10000000000)).toISOString() 
        });
    }
    
    return catalog;
};

// Initialize the global product database
const products = generateCatalog();
//indra


// --- 3. MOCK APIS & UTILITIES --- //

/**
 * Simulates a network delay to fetch real-time reviews for a specific product.
 * Returns a Promise that resolves with an array of review objects.
 * @param {string} productId - The ID of the product
 * @returns {Promise<Array>}
 */
const fetchProductReviewsAPI = (productId) => {
    return new Promise((resolve) => {
        // Simulate network latency (400ms - 1200ms) to feel like a real DB call
        const delay = getRandomInt(400, 1200);
        
        setTimeout(() => {
            const numReviews = getRandomInt(3, 8);
            const mockReviews = [];
            
            const reviewTexts = [
                "Absolutely love this product! The qualiity s amazing for the price point. Highly recommend buying it from Zigzex.",
                "Fast delivery by Zigzex Mart. The product is exactly as described in the pictures.",
                "Good, but could be slightly better. Still a solid 4 stars. Will buy again.",
                "Premium feel and looks great. The packaging was also very secure and luxurious.",
                "Value for money. Got it during the flash sale, total steal deal!",
                "Excellent customer support. The product is functioning perfectly.",
                "A bit expensive without the discount, but totally worth it. The brand quality speaks for itself."
            ];
            
            const reviewerNames = ["Rahul Sharma", "Priya Menon", "Amit Kumar", "Neha Reddy", "Vikram Singh", "Anjali Desai", "Karthik P.", "Sneha Iyer", "Rohan Gupta"];
            
            for(let i=0; i < numReviews; i++) {
                mockReviews.push({
                    id: `REV-${getRandomInt(10000, 99999)}`,
                    user: getRandomItem(reviewerNames),
                    rating: getRandomInt(4, 5), // Mostly positive reviews
                    text: getRandomItem(reviewTexts),
                    date: new Date(Date.now() - getRandomInt(100000, 5000000000)).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'short', day: 'numeric'
                    }),
                    verifiedPurchase: true
                });
            }
            
            resolve(mockReviews);
        }, delay);
    });
};

/**
 * Utility to format numbers as Indian Rupees (₹)
 * Handles lakhs and crores correctly based on Indian numbering system
 * @param {number} num 
 * @returns {string} Formatted currency string
 */
const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(num);
};

// Export to window object so app.js can access all data and utilities globally
window.ZigzexData = {
    products,
    fetchProductReviewsAPI,
    formatCurrency,
    categories,
    brandMap
};