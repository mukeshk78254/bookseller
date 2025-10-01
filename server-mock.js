const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './config.env' });

const app = express();

// Mock data storage
let sellers = [];
let books = [];
let nextSellerId = 1;
let nextBookId = 1;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('dev'));

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please provide a valid token.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const seller = sellers.find(s => s.id === decoded.id);
    
    if (!seller) {
      return res.status(401).json({
        success: false,
        message: 'No seller found with this token'
      });
    }

    req.seller = seller;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Invalid token.'
    });
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Jira Seller API is running (Mock Mode)',
    timestamp: new Date().toISOString(),
    environment: 'development'
  });
});

// Seller registration
app.post('/api/seller/register', (req, res) => {
  const { name, email, password, phone, address, businessInfo, bankDetails } = req.body;

  // Check if seller already exists
  const existingSeller = sellers.find(s => s.email === email);
  if (existingSeller) {
    return res.status(400).json({
      success: false,
      message: 'Seller already exists with this email'
    });
  }

  const seller = {
    id: nextSellerId++,
    name,
    email,
    password, // In real app, this would be hashed
    phone,
    address,
    businessInfo,
    bankDetails,
    status: 'approved', // Auto-approve for testing
    isActive: true,
    createdAt: new Date()
  };

  sellers.push(seller);

  const token = jwt.sign({ id: seller.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    success: true,
    message: 'Seller registered successfully',
    token,
    seller: {
      id: seller.id,
      name: seller.name,
      email: seller.email,
      status: seller.status,
      businessName: seller.businessInfo.businessName
    }
  });
});

// Seller login
app.post('/api/seller/login', (req, res) => {
  const { email, password } = req.body;

  const seller = sellers.find(s => s.email === email && s.password === password);
  if (!seller) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  const token = jwt.sign({ id: seller.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    seller: {
      id: seller.id,
      name: seller.name,
      email: seller.email,
      status: seller.status,
      businessName: seller.businessInfo.businessName
    }
  });
});

// Get seller profile
app.get('/api/seller/profile', mockAuth, (req, res) => {
  res.status(200).json({
    success: true,
    seller: req.seller
  });
});

// Create book
app.post('/api/seller/books', mockAuth, (req, res) => {
  const bookData = {
    id: nextBookId++,
    ...req.body,
    seller: req.seller.id,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  books.push(bookData);

  res.status(201).json({
    success: true,
    message: 'Book created successfully',
    book: bookData
  });
});

// Get all books
app.get('/api/seller/books', mockAuth, (req, res) => {
  const sellerBooks = books.filter(book => book.seller === req.seller.id);
  
  res.status(200).json({
    success: true,
    count: sellerBooks.length,
    books: sellerBooks
  });
});

// Get single book
app.get('/api/seller/books/:id', mockAuth, (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id) && b.seller === req.seller.id);
  
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found or you do not have permission to view it'
    });
  }

  res.status(200).json({
    success: true,
    book
  });
});

// Update stock and price
app.put('/api/seller/books/:id/stock-price', mockAuth, (req, res) => {
  const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id) && b.seller === req.seller.id);
  
  if (bookIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Book not found or you do not have permission to update it'
    });
  }

  const { stock, price, discount, minStock } = req.body;
  
  if (stock !== undefined) books[bookIndex].stock = stock;
  if (price !== undefined) books[bookIndex].price = price;
  if (discount !== undefined) books[bookIndex].discount = discount;
  if (minStock !== undefined) books[bookIndex].minStock = minStock;
  
  books[bookIndex].updatedAt = new Date();

  res.status(200).json({
    success: true,
    message: 'Book stock and price updated successfully',
    book: books[bookIndex]
  });
});

// Delete book
app.delete('/api/seller/books/:id', mockAuth, (req, res) => {
  const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id) && b.seller === req.seller.id);
  
  if (bookIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Book not found or you do not have permission to delete it'
    });
  }

  books.splice(bookIndex, 1);

  res.status(200).json({
    success: true,
    message: 'Book deleted successfully'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Jira Seller API (Mock Mode)',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      register: 'POST /api/seller/register',
      login: 'POST /api/seller/login',
      books: '/api/seller/books'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Jira Seller API Server (Mock Mode) running on port ${PORT}`);
  console.log(`📊 Environment: development`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api/seller`);
  console.log(`\n📝 Test with these endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/seller/register`);
  console.log(`   POST http://localhost:${PORT}/api/seller/login`);
  console.log(`   GET  http://localhost:${PORT}/api/seller/books`);
});

module.exports = app;
