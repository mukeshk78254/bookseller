# Jira Seller Backend API

A comprehensive backend API for managing seller book listings with features for stock management, pricing, and book operations.

## 🚀 Features

- **Seller Management**: Registration, authentication, and profile management
- **Book Management**: Create, read, update, and delete book listings
- **Stock & Price Management**: Update stock quantities and pricing
- **Analytics**: Book performance and sales analytics
- **Security**: JWT authentication, rate limiting, and input validation
- **Database**: MongoDB with Mongoose ODM

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jira
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp config.env .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/jira_seller_db
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Endpoints

### Authentication Endpoints

#### Register Seller
```http
POST /api/seller/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "businessInfo": {
    "businessName": "John's Bookstore",
    "gstNumber": "12ABCDE1234F1Z5",
    "panNumber": "ABCDE1234F"
  },
  "bankDetails": {
    "accountNumber": "1234567890",
    "ifscCode": "SBIN0001234",
    "bankName": "State Bank of India",
    "accountHolderName": "John Doe"
  }
}
```

#### Login Seller
```http
POST /api/seller/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Book Management Endpoints

#### Create Book
```http
POST /api/seller/books
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565",
  "description": "A classic American novel...",
  "category": "Fiction",
  "language": "English",
  "publisher": "Scribner",
  "publicationYear": 1925,
  "pages": 180,
  "format": "Paperback",
  "condition": "New",
  "price": 12.99,
  "stock": 50,
  "minStock": 5,
  "weight": 0.3,
  "tags": ["classic", "literature", "american"]
}
```

#### Get All Books
```http
GET /api/seller/books?page=1&limit=10&status=active&category=Fiction&search=gatsby
Authorization: Bearer <token>
```

#### Get Single Book
```http
GET /api/seller/books/:id
Authorization: Bearer <token>
```

#### Update Stock and Price ⭐
```http
PUT /api/seller/books/:id/stock-price
Authorization: Bearer <token>
Content-Type: application/json

{
  "stock": 25,
  "price": 14.99,
  "discount": 10,
  "minStock": 3
}
```

#### Update Entire Book
```http
PUT /api/seller/books/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description...",
  "price": 15.99
}
```

#### Delete Book ⭐
```http
DELETE /api/seller/books/:id
Authorization: Bearer <token>
```

### Additional Endpoints

#### Get Seller Profile
```http
GET /api/seller/profile
Authorization: Bearer <token>
```

#### Update Seller Profile
```http
PUT /api/seller/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+1234567890"
}
```

#### Get Dashboard Stats
```http
GET /api/seller/dashboard
Authorization: Bearer <token>
```

#### Get Book Analytics
```http
GET /api/seller/books/:id/analytics
Authorization: Bearer <token>
```

#### Bulk Update Books Status
```http
PUT /api/seller/books/bulk/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookIds": ["bookId1", "bookId2", "bookId3"],
  "status": "active"
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## 📊 Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## 🗄️ Database Models

### Seller Model
- Personal information (name, email, phone)
- Address details
- Business information (GST, PAN)
- Bank details
- Account status and approval

### Book Model
- Basic book information (title, author, ISBN)
- Publishing details
- Pricing and stock information
- Seller reference
- Analytics and ratings

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive validation using express-validator
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Password Hashing**: Bcrypt for secure password storage

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/jira_seller_db` |
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` |

## 🚀 Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start server.js --name "jira-seller-api"
```

### Using Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📈 Performance

- **Compression**: Gzip compression enabled
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Ready for Redis integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: [your-email@example.com]

## 🔄 Version History

- **v1.0.0** - Initial release with basic CRUD operations
- **v1.1.0** - Added analytics and bulk operations
- **v1.2.0** - Enhanced security and validation

---

**Note**: Make sure to change the JWT secret and other sensitive information in production!
