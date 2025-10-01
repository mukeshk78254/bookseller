const express = require('express');
const {
  registerSeller,
  loginSeller,
  getSellerProfile,
  updateSellerProfile,
  logoutSeller,
  getSellerDashboard
} = require('../controllers/sellerController');

const {
  createBook,
  getSellerBooks,
  getBookById,
  updateStockAndPrice,
  updateBook,
  deleteBook,
  bulkUpdateBooksStatus,
  getBookAnalytics
} = require('../controllers/bookController');

const { protect } = require('../middleware/auth');
const {
  validateSeller,
  validateLogin,
  validateBook,
  validateStockPriceUpdate,
  validateBookId,
  validateImages
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateSeller, registerSeller);
router.post('/login', validateLogin, loginSeller);

// Protected routes
router.use(protect); // All routes below this middleware are protected

// Seller profile routes
router.get('/profile', getSellerProfile);
router.put('/profile', updateSellerProfile);
router.post('/logout', logoutSeller);
router.get('/dashboard', getSellerDashboard);

// Book management routes
router.route('/books')
  .get(getSellerBooks)
  .post(validateBook, createBook);

router.route('/books/:id')
  .get(validateBookId, getBookById)
  .put(validateBookId, updateBook)
  .delete(validateBookId, deleteBook);

// Stock and price update route
router.put('/books/:id/stock-price', validateBookId, validateStockPriceUpdate, updateStockAndPrice);

// Bulk operations
router.put('/books/bulk/status', bulkUpdateBooksStatus);

// Analytics
router.get('/books/:id/analytics', validateBookId, getBookAnalytics);

module.exports = router;
