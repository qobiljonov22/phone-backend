# Phone Backend Test API Server

A comprehensive test API server for the Phone Backend system. This server provides real API endpoints for testing, monitoring, and managing test data.

## 🚀 Quick Start

### Start the Test API Server
```bash
npm run test-api
```

The test API server will run on `http://localhost:4000`

### Run Automated Tests
```bash
# Test against main API (localhost:5000)
curl -X POST http://localhost:4000/api/test/run

# Test against custom API URL
curl -X POST http://localhost:4000/api/test/run \
  -H "Content-Type: application/json" \
  -d '{"mainApiUrl": "http://localhost:5000"}'
```

## 📊 API Endpoints

### Core Endpoints
- `GET /` - API information and available endpoints
- `GET /api/health` - Health check for test API server
- `POST /api/test/run` - Run complete test suite against main API

### Test Data Management
- `GET /api/test/users` - Get all test users
- `POST /api/test/users` - Create test user
- `GET /api/test/orders` - Get all test orders
- `POST /api/test/orders` - Create test order
- `GET /api/test/reviews` - Get all test reviews

### Analytics & Monitoring
- `GET /api/test/analytics` - Test data analytics
- `GET /api/test/dashboard` - Test dashboard overview
- `DELETE /api/test/clear` - Clear all test data

## 🧪 Test Suite Features

The automated test suite includes:

### ✅ **Core API Tests**
- Health check validation
- Database seeding verification
- Phone catalog retrieval
- Search functionality

### ✅ **User Management Tests**
- User registration
- Profile management
- Wishlist functionality

### ✅ **E-commerce Tests**
- Shopping cart operations
- Order creation and management
- Payment processing simulation

### ✅ **Content Tests**
- Review system
- Rating functionality
- Content moderation

### ✅ **Business Intelligence Tests**
- Analytics tracking
- Dashboard data
- Reporting systems

### ✅ **Advanced Features Tests**
- Category management
- Advanced filtering
- Phone comparison
- Inventory tracking

## 📈 Usage Examples

### Run Complete Test Suite
```bash
curl -X POST http://localhost:4000/api/test/run \
  -H "Content-Type: application/json" \
  -d '{
    "mainApiUrl": "http://localhost:5000"
  }'
```

### Create Test User
```bash
curl -X POST http://localhost:4000/api/test/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }'
```

### Create Test Order
```bash
curl -X POST http://localhost:4000/api/test/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_1",
    "items": [
      {
        "phoneId": "iphone-15-pro-128",
        "quantity": 1,
        "price": 999
      }
    ],
    "total": 999
  }'
```

### Get Analytics
```bash
curl http://localhost:4000/api/test/analytics
```

### View Dashboard
```bash
curl http://localhost:4000/api/test/dashboard
```

## 📊 Response Examples

### Test Suite Results
```json
{
  "message": "Test suite completed",
  "results": {
    "startTime": "2024-01-08T10:00:00.000Z",
    "endTime": "2024-01-08T10:00:30.000Z",
    "mainApiUrl": "http://localhost:5000",
    "tests": [
      {
        "name": "Health Check",
        "success": true,
        "duration": 45,
        "status": 200,
        "data": { "status": "OK" }
      }
    ],
    "summary": {
      "total": 10,
      "passed": 9,
      "failed": 1,
      "duration": 30000
    }
  }
}
```

### Analytics Response
```json
{
  "users": {
    "total": 5,
    "testUsers": 3
  },
  "orders": {
    "total": 12,
    "testOrders": 8,
    "totalValue": 8500
  },
  "reviews": {
    "total": 15,
    "averageRating": 4.2
  },
  "serverUptime": 3600,
  "timestamp": "2024-01-08T10:00:00.000Z"
}
```

### Dashboard Response
```json
{
  "overview": {
    "totalUsers": 5,
    "totalOrders": 12,
    "totalRevenue": 8500,
    "totalReviews": 15,
    "averageRating": 4.2
  },
  "recentActivity": [
    {
      "type": "order",
      "message": "Order TEST-1001 created",
      "timestamp": "2024-01-08T09:55:00.000Z",
      "value": 999
    }
  ],
  "performance": {
    "uptime": 3600,
    "memory": {
      "rss": 45678912,
      "heapTotal": 12345678,
      "heapUsed": 8765432
    },
    "responseTime": 75.5
  }
}
```

## 🔧 Configuration

### Environment Variables
```env
TEST_API_PORT=4000  # Port for test API server
```

### Test Configuration
The test suite can be configured by modifying the request body:

```json
{
  "mainApiUrl": "http://localhost:3000",
  "timeout": 30000,
  "retries": 3,
  "verbose": true
}
```

## 🚀 Integration

### CI/CD Integration
```bash
# In your CI/CD pipeline
npm run test-api &
sleep 5
curl -f http://localhost:4000/api/test/run || exit 1
```

### Docker Integration
```dockerfile
# Add to your Dockerfile
EXPOSE 4000
CMD ["npm", "run", "test-api"]
```

### Monitoring Integration
```bash
# Health check for monitoring systems
curl -f http://localhost:4000/api/health
```

## 📝 Development

### Adding New Tests
1. Add test function to the test suite
2. Update the test runner
3. Add corresponding endpoints if needed

### Custom Test Data
Use the test data management endpoints to create specific test scenarios:

```javascript
// Create custom test scenario
const testScenario = {
  users: 10,
  ordersPerUser: 2,
  reviewsPerOrder: 1
};
```

## 🔍 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9
```

**Test Failures**
```bash
# Check main API server is running
curl http://localhost:5000/api/health

# Clear test data and retry
curl -X DELETE http://localhost:4000/api/test/clear
```

**Memory Issues**
```bash
# Monitor memory usage
curl http://localhost:4000/api/test/analytics
```

## 📊 Monitoring & Metrics

The test API provides comprehensive monitoring:

- **Performance Metrics**: Response times, memory usage, uptime
- **Test Results**: Pass/fail rates, duration tracking
- **Data Analytics**: User behavior, order patterns, review trends
- **Health Monitoring**: Server status, error rates, resource usage

## 🎯 Best Practices

1. **Run tests regularly** to catch regressions early
2. **Clear test data** between test runs for consistency
3. **Monitor performance** metrics to identify bottlenecks
4. **Use realistic test data** for accurate results
5. **Integrate with CI/CD** for automated testing

## License

MIT - Same as main Phone Backend API