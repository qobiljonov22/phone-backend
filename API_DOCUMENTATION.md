# Phone Backend API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
Some endpoints may require API key authentication via `x-api-key` header.

## Endpoints

### 🏠 General Endpoints

#### GET /
Get API information and available endpoints
```bash
curl http://localhost:3000/
```

#### GET /api/health
Health check endpoint
```bash
curl http://localhost:3000/api/health
```

#### GET /api/stats
Get database statistics
```bash
curl http://localhost:3000/api/stats
```

### 📱 Phone Management

#### GET /api/phones
Get all phones with filtering and pagination

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `brand` (string): Filter by brand name
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `sort` (string): Sort by: `name`, `price_asc`, `price_desc`

```bash
# Get all phones
curl http://localhost:3000/api/phones

# Filter by brand and price
curl "http://localhost:3000/api/phones?brand=iPhone&minPrice=800&maxPrice=1200"

# Sort by price ascending
curl "http://localhost:3000/api/phones?sort=price_asc&limit=5"
```

#### POST /api/phones
Create a new phone

```bash
curl -X POST http://localhost:3000/api/phones \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "iPhone",
    "model": "15 Pro Max",
    "price": 1199,
    "storage": "256GB",
    "color": "Natural Titanium",
    "description": "Latest iPhone with titanium design",
    "specifications": {
      "display": "6.7-inch Super Retina XDR",
      "chip": "A17 Pro",
      "camera": "Pro camera system"
    }
  }'
```

#### GET /api/phones/:id
Get a specific phone by ID

```bash
curl http://localhost:3000/api/phones/iphone-15-pro-128
```

#### PUT /api/phones/:id
Update a phone

```bash
curl -X PUT http://localhost:3000/api/phones/iphone-15-pro-128 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1099,
    "inStock": true
  }'
```

#### DELETE /api/phones/:id
Delete a phone

```bash
curl -X DELETE http://localhost:3000/api/phones/iphone-15-pro-128
```

### 🔍 Search & Discovery

#### GET /api/phones/search/:query
Search phones by brand, model, or description

```bash
curl http://localhost:3000/api/phones/search/iPhone
curl http://localhost:3000/api/phones/search/Samsung
```

#### GET /api/brands
Get all available brands

```bash
curl http://localhost:3000/api/brands
```

#### GET /api/phones/category/:category
Get phones by category

```bash
curl http://localhost:3000/api/phones/category/smartphone
```

#### GET /api/phones/featured
Get featured phones (highest rated)

```bash
curl http://localhost:3000/api/phones/featured
```

#### GET /api/phones/price-range
Get phones grouped by price ranges (budget, mid, premium)

```bash
curl http://localhost:3000/api/phones/price-range
```

### 📊 Advanced Features

#### POST /api/phones/compare
Compare multiple phones (2-4 phones)

```bash
curl -X POST http://localhost:3000/api/phones/compare \
  -H "Content-Type: application/json" \
  -d '{
    "phoneIds": ["iphone-15-pro-128", "galaxy-s24-ultra-512", "pixel-8-pro-256"]
  }'
```

#### POST /api/phones/bulk
Create multiple phones at once

```bash
curl -X POST http://localhost:3000/api/phones/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "phones": [
      {
        "brand": "iPhone",
        "model": "15",
        "price": 899,
        "storage": "128GB",
        "color": "Pink"
      },
      {
        "brand": "Samsung",
        "model": "Galaxy A54",
        "price": 449,
        "storage": "128GB",
        "color": "Awesome Blue"
      }
    ]
  }'
```

#### POST /api/seed
Seed database with sample data (based on Figma design)

```bash
curl -X POST http://localhost:3000/api/seed
```

## Response Format

### Success Response
```json
{
  "phones": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Phone Object Schema

```json
{
  "_id": "unique-phone-id",
  "brand": "iPhone",
  "model": "15 Pro",
  "price": 999,
  "storage": "128GB",
  "color": "Natural Titanium",
  "description": "Phone description",
  "specifications": {
    "display": "6.1-inch Super Retina XDR",
    "chip": "A17 Pro",
    "camera": "Pro camera system",
    "battery": "Up to 23 hours video playback",
    "os": "iOS 17"
  },
  "images": ["url1", "url2"],
  "inStock": true,
  "category": "smartphone",
  "rating": 4.8,
  "reviews": 1850,
  "createdAt": "2024-01-07T...",
  "updatedAt": "2024-01-07T..."
}
```

## Available Phones (Seed Data)

The API includes comprehensive data for:

### iPhone Models
- iPhone 14 (128GB, 256GB)
- iPhone 15 (128GB)
- iPhone 15 Pro (128GB)
- iPhone 15 Pro Max (256GB)

### Samsung Galaxy Models
- Galaxy S24 (128GB)
- Galaxy S24+ (256GB)
- Galaxy S24 Ultra (512GB)

### Google Pixel Models
- Pixel 8 (128GB)
- Pixel 8 Pro (256GB)

### Other Brands
- OnePlus 12 (256GB)
- Xiaomi 14 (256GB)

## Quick Start

1. Start the server:
   ```bash
   npm start
   ```

2. Seed the database:
   ```bash
   npm run seed
   ```

3. Test the API:
   ```bash
   curl http://localhost:3000/api/phones
   ```