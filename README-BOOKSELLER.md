# BookSeller API - SEAR-19 Implementation

## 🎯 **Task Completed: SEAR-19**

**Branch**: `SEAR-19-api-seller-books-id-stock-price-update-stock-price-and-api-seller-books-id-delete-delete-listing`

**Implemented Endpoints**:
- ✅ `PUT /api/seller/books/:id/stock-price` — Update stock & price
- ✅ `DELETE /api/seller/books/:id` — Delete listing

## 🚀 **Quick Start**

### **1. Installation**
```bash
git clone https://github.com/mukeshk78254/bookseller.git
cd bookseller
npm install
```

### **2. Environment Setup**
```bash
cp config.env .env
# Edit .env with your configuration
```

### **3. Run Server**
```bash
# Mock mode (no database required)
node server-mock.js

# Full mode (requires MongoDB)
npm run dev
```

## 📚 **API Endpoints**

### **Authentication**
```http
POST /api/seller/register    # Register new seller
POST /api/seller/login       # Login seller
GET  /api/seller/profile     # Get seller profile
```

### **Book Management**
```http
POST   /api/seller/books                    # Create book
GET    /api/seller/books                    # Get all books
GET    /api/seller/books/:id                # Get single book
PUT    /api/seller/books/:id                # Update book
DELETE /api/seller/books/:id                # Delete book ⭐
PUT    /api/seller/books/:id/stock-price    # Update stock & price ⭐
```

## 🧪 **Testing the Main Endpoints**

### **1. Register Seller**
```bash
curl -X POST http://localhost:5000/api/seller/register \
  -H "Content-Type: application/json" \
  -d '{
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
      "businessName": "John Books",
      "gstNumber": "12ABCDE1234F1Z5",
      "panNumber": "ABCDE1234F"
    },
    "bankDetails": {
      "accountNumber": "1234567890",
      "ifscCode": "SBIN0001234",
      "bankName": "State Bank",
      "accountHolderName": "John Doe"
    }
  }'
```

### **2. Login Seller**
```bash
curl -X POST http://localhost:5000/api/seller/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### **3. Create Book**
```bash
curl -X POST http://localhost:5000/api/seller/books \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "description": "A classic American novel",
    "category": "Fiction",
    "language": "English",
    "publisher": "Scribner",
    "publicationYear": 1925,
    "pages": 180,
    "format": "Paperback",
    "condition": "New",
    "price": 12.99,
    "stock": 50,
    "minStock": 5
  }'
```

### **4. Update Stock & Price ⭐**
```bash
curl -X PUT http://localhost:5000/api/seller/books/1/stock-price \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 25,
    "price": 14.99,
    "discount": 10,
    "minStock": 3
  }'
```

### **5. Delete Book ⭐**
```bash
curl -X DELETE http://localhost:5000/api/seller/books/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📋 **Postman Collection**

### **Environment Variables**
```
base_url: http://localhost:5000
token: {{login_response_token}}
```

### **Request Examples**

#### **Update Stock & Price**
- **Method**: `PUT`
- **URL**: `{{base_url}}/api/seller/books/1/stock-price`
- **Headers**:
  ```
  Authorization: Bearer {{token}}
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "stock": 25,
    "price": 14.99,
    "discount": 10,
    "minStock": 3
  }
  ```

#### **Delete Book**
- **Method**: `DELETE`
- **URL**: `{{base_url}}/api/seller/books/1`
- **Headers**:
  ```
  Authorization: Bearer {{token}}
  ```

## 🔧 **Project Structure**

```
bookseller/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── sellerController.js  # Seller management
│   └── bookController.js    # Book management ⭐
├── middleware/
│   ├── auth.js             # JWT authentication
│   └── validation.js       # Input validation
├── models/
│   ├── Seller.js           # Seller schema
│   └── Book.js             # Book schema
├── routes/
│   └── sellerRoutes.js     # API routes ⭐
├── test/
│   └── api.test.js         # API tests
├── server.js               # Main server
├── server-mock.js          # Mock server (no DB)
└── package.json            # Dependencies
```

## 🎯 **Key Features Implemented**

### **Stock & Price Management**
- ✅ Update stock quantity
- ✅ Update book price
- ✅ Set discount percentage
- ✅ Update minimum stock threshold
- ✅ Auto-update book status based on stock

### **Book Deletion**
- ✅ Secure deletion with ownership verification
- ✅ JWT authentication required
- ✅ Proper error handling
- ✅ Success confirmation

### **Security**
- ✅ JWT token authentication
- ✅ Input validation
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Helmet security headers

## 🧪 **Testing**

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 📊 **Response Examples**

### **Update Stock & Price Success**
```json
{
  "success": true,
  "message": "Book stock and price updated successfully",
  "book": {
    "id": 1,
    "title": "The Great Gatsby",
    "stock": 25,
    "price": 14.99,
    "discount": 10,
    "minStock": 3,
    "status": "active"
  }
}
```

### **Delete Book Success**
```json
{
  "success": true,
  "message": "Book deleted successfully"
}
```

## 🚀 **Deployment**

### **Production Setup**
```bash
# Install dependencies
npm install --production

# Set environment variables
export NODE_ENV=production
export MONGODB_URI=your_mongodb_uri
export JWT_SECRET=your_jwt_secret

# Start server
npm start
```

### **Docker Deployment**
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📝 **API Documentation**

- **Base URL**: `http://localhost:5000`
- **Authentication**: Bearer Token (JWT)
- **Content-Type**: `application/json`
- **Rate Limit**: 100 requests per 15 minutes

## ✅ **Task Completion Status**

- ✅ **SEAR-19** - Stock & Price Update endpoint implemented
- ✅ **SEAR-19** - Delete listing endpoint implemented
- ✅ **Authentication** - JWT-based security
- ✅ **Validation** - Input validation and error handling
- ✅ **Testing** - Comprehensive test suite
- ✅ **Documentation** - Complete API documentation
- ✅ **Deployment** - Production-ready setup

## 🔗 **Repository Links**

- **GitHub**: [https://github.com/mukeshk78254/bookseller.git](https://github.com/mukeshk78254/bookseller.git)
- **Branch**: `SEAR-19-api-seller-books-id-stock-price-update-stock-price-and-api-seller-books-id-delete-delete-listing`

---

**Task SEAR-19 Completed Successfully!** 🎉
