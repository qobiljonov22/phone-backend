// Seed data based on Figma design
const phonesSeedData = [
  // iPhone Models
  {
    _id: "iphone-14-128",
    brand: "iPhone",
    model: "iPhone 14",
    price: 799,
    storage: "128GB",
    color: "Midnight",
    description: "iPhone 14 with A15 Bionic chip and advanced camera system",
    specifications: {
      display: "6.1-inch Super Retina XDR",
      chip: "A15 Bionic",
      camera: "Dual 12MP system",
      battery: "Up to 20 hours video playback",
      os: "iOS 16"
    },
    images: [
      "https://example.com/iphone14-midnight-1.jpg",
      "https://example.com/iphone14-midnight-2.jpg"
    ],
    inStock: true,
    category: "smartphone",
    rating: 4.5,
    reviews: 1250,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "iphone-14-256",
    brand: "iPhone",
    model: "iPhone 14",
    price: 899,
    storage: "256GB",
    color: "Blue",
    description: "iPhone 14 with A15 Bionic chip and advanced camera system",
    specifications: {
      display: "6.1-inch Super Retina XDR",
      chip: "A15 Bionic",
      camera: "Dual 12MP system",
      battery: "Up to 20 hours video playback",
      os: "iOS 16"
    },
    images: [
      "https://example.com/iphone14-blue-1.jpg",
      "https://example.com/iphone14-blue-2.jpg"
    ],
    inStock: true,
    category: "smartphone",
    rating: 4.5,
    reviews: 980,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "iphone-15-128",
    brand: "iPhone",
    model: "iPhone 15",
    price: 899,
    storage: "128GB",
    color: "Pink",
    description: "iPhone 15 with A16 Bionic chip and USB-C",
    specifications: {
      display: "6.1-inch Super Retina XDR",
      chip: "A16 Bionic",
      camera: "Advanced dual-camera system",
      battery: "Up to 22 hours video playback",
      os: "iOS 17",
      connector: "USB-C"
    },
    images: [
      "https://example.com/iphone15-pink-1.jpg",
      "https://example.com/iphone15-pink-2.jpg"
    ],
    inStock: true,
    category: "smartphone",
    rating: 4.7,
    reviews: 2100,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "iphone-15-pro-128",
    brand: "iPhone",
    model: "iPhone 15 Pro",
    price: 999,
    storage: "128GB",
    color: "Natural Titanium",
    description: "iPhone 15 Pro with A17 Pro chip and titanium design",
    specifications: {
      display: "6.1-inch Super Retina XDR with ProMotion",
      chip: "A17 Pro",
      camera: "Pro camera system with 3x Telephoto",
      battery: "Up to 23 hours video playback",
      os: "iOS 17",
      material: "Titanium",
      connector: "USB-C"
    },
    images: [
      "https://example.com/iphone15pro-titanium-1.jpg",
      "https://example.com/iphone15pro-titanium-2.jpg"
    ],
    inStock: true,
    category: "smartphone",
    rating: 4.8,
    reviews: 1850,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "iphone-15-pro-max-256",
    brand: "iPhone",
    model: "iPhone 15 Pro Max",
    price: 1199,
    storage: "256GB",
    color: "Blue Titanium",
    description: "iPhone 15 Pro Max with largest display and longest battery life",
    specifications: {
      display: "6.7-inch Super Retina XDR with ProMotion",
      chip: "A17 Pro",
      camera: "Pro camera system with 5x Telephoto",
      battery: "Up to 29 hours video playback",
      os: "iOS 17",
      material: "Titanium",
      connector: "USB-C"
    },
    images: [
      "https://example.com/iphone15promax-blue-1.jpg",
      "https://example.com/iphone15promax-blue-2.jpg"
    ],
    inStock: true,
    category: "smartphone",
    rating: 4.9,
    reviews: 1650,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Samsung Galaxy Models
  {
    _id: "galaxy-s24-128",
    brand: "Samsung",
    model: "Galaxy S24",
    price: 799,
    storage: "128GB",
    color: "Phantom Black",
    description: "Galaxy S24 with Snapdragon 8 Gen 3 and AI features",
    specifications: {
      display: "6.2-inch Dynamic AMOLED 2X",
      chip: "Snapdragon 8 Gen 3",
      camera: "Triple camera with 50MP main",
      battery: "4000mAh with 25W charging",
      os: "Android 14 with One UI 6.1",
      ram: "8GB"
    },
    images: [
      "https://example.com/galaxys24-black-1.jpg",
      "https://example.com/galaxys24-black-2.jpg"
    ],
    inStock: true,
    category: "smartphone",
    rating: 4.4,
    reviews: 890,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "galaxy-s24-plus-256",
    brand: "Samsung",
    model: "Galaxy S24+",
    price: 999,
    storage: "256GB",
    color: "Cream",
    description: "Galaxy S24+ with larger display and enhanced performance",
    specifications: {
      display: "6.7-inch Dynamic AMOLED 2X",
      chip: "Snapdragon 8 Gen 3",
      camera: "Triple camera with 50MP main",
      battery: "4900mAh with 45W charging",
      os: "Android 14 with One UI 6.1",
      ram: "12GB"
    },
    images: [
      "https://example.com/galaxys24plus-cream-1.jpg",
      "https://example.com/galaxys24plus-cream-2.jpg"
    ],
    inStock: true,
    category: "smartphone",
    rating: 4.6,
    reviews: 720,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "galaxy-s24-ultra-512",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    price: 1299,
    storage: "512GB",
    color: "Titanium Gray",
    description: "Galaxy S24 Ultra with S Pen and 200MP camera",
    specifications: {
      display: "6.8-inch Dynamic AMOLED 2X with S Pen",
      chip: "Snapdragon 8 Gen 3",
      camera: "Quad camera with 200MP main",
      battery: "5000mAh with 45W charging",
      os: "Android 14 with One UI 6.1",
      ram: "12GB",
      features: "S Pen included"
    },
    images: [
      "https://example.com/galaxys24ultra-gray-1.jpg",
      "https://example.com/galaxys24ultra-gray-2.jpg"
    ],
    inStock: true,
    category: "smartphone",
    rating: 4.8,
    reviews: 1100,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Google Pixel Models
  {
    _id: "pixel-8-128",
    brand: "Google",
    model: "Pixel 8",
    price: 699,
    storage: "128GB",
    color: "Obsidian",
    description: "Pixel 8 with Google Tensor G3 and AI photography",
    specifications: {
      display: "6.2-inch Actua display",
      chip: "Google Tensor G3",
      camera: "Dual camera with computational photography",
      battery: "4575mAh with 27W charging",
      os: "Android 14",
      ram: "8GB",
      features: "7 years of updates"
    },
    images: [
      "https://example.com/pixel8-obsidian-1.jpg",
      "https://example.com/pixel8-obsidian-2.jpg"
    ],
    inStock: true,
    category: "smartphone",
    rating: 4.3,
    reviews: 650,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "pixel-8-pro-256",
    brand: "Google",
    model: "Pixel 8 Pro",
    price: 999,
    storage: "256GB",
    color: "Bay",
    description: "Pixel 8 Pro with Pro camera features and larger display",
    specifications: {
      display: "6.7-inch Super Actua display with 120Hz",
      chip: "Google Tensor G3",
      camera: "Triple camera with telephoto and macro",
      battery: "5050mAh with 30W charging",
      os: "Android 14",
      ram: "12GB",
      features: "7 years of updates, Temperature sensor"
    },
    images: [
      "https://example.com/pixel8pro-bay-1.jpg",
      "https://example.com/pixel8pro-bay-2.jpg"
    ],
    inStock: false,
    category: "smartphone",
    rating: 4.5,
    reviews: 480,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // OnePlus Models
  {
    _id: "oneplus-12-256",
    brand: "OnePlus",
    model: "OnePlus 12",
    price: 799,
    storage: "256GB",
    color: "Silky Black",
    description: "OnePlus 12 with Snapdragon 8 Gen 3 and fast charging",
    specifications: {
      display: "6.82-inch LTPO AMOLED with 120Hz",
      chip: "Snapdragon 8 Gen 3",
      camera: "Triple camera with Hasselblad tuning",
      battery: "5400mAh with 100W SuperVOOC",
      os: "OxygenOS 14 based on Android 14",
      ram: "12GB"
    },
    images: [
      "https://example.com/oneplus12-black-1.jpg",
      "https://example.com/oneplus12-black-2.jpg"
    ],
    inStock: true,
    category: "smartphone",
    rating: 4.4,
    reviews: 320,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Xiaomi Models
  {
    _id: "xiaomi-14-256",
    brand: "Xiaomi",
    model: "Xiaomi 14",
    price: 699,
    storage: "256GB",
    color: "Black",
    description: "Xiaomi 14 with Snapdragon 8 Gen 3 and Leica cameras",
    specifications: {
      display: "6.36-inch LTPO OLED with 120Hz",
      chip: "Snapdragon 8 Gen 3",
      camera: "Triple camera with Leica optics",
      battery: "4610mAh with 90W charging",
      os: "MIUI 15 based on Android 14",
      ram: "12GB"
    },
    images: [
      "https://example.com/xiaomi14-black-1.jpg",
      "https://example.com/xiaomi14-black-2.jpg"
    ],
    inStock: true,
    category: "smartphone",
    rating: 4.2,
    reviews: 280,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

module.exports = phonesSeedData;