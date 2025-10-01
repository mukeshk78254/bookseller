const { body, param, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Book validation rules
const validateBook = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Book title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author name is required')
    .isLength({ max: 100 })
    .withMessage('Author name cannot exceed 100 characters'),
  
  body('isbn')
    .trim()
    .notEmpty()
    .withMessage('ISBN is required')
    .matches(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/)
    .withMessage('Please provide a valid ISBN'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Book description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 
      'Biography', 'Self-Help', 'Business', 'Education', 'Children',
      'Romance', 'Mystery', 'Thriller', 'Fantasy', 'Science Fiction',
      'Health', 'Cooking', 'Travel', 'Art', 'Religion', 'Philosophy',
      'Other'
    ])
    .withMessage('Invalid category selected'),
  
  body('language')
    .optional()
    .trim()
    .isIn(['English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Other'])
    .withMessage('Invalid language selected'),
  
  body('publisher')
    .trim()
    .notEmpty()
    .withMessage('Publisher is required')
    .isLength({ max: 100 })
    .withMessage('Publisher name cannot exceed 100 characters'),
  
  body('publicationYear')
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage('Invalid publication year'),
  
  body('pages')
    .isInt({ min: 1 })
    .withMessage('Number of pages must be a positive integer'),
  
  body('format')
    .trim()
    .notEmpty()
    .withMessage('Book format is required')
    .isIn(['Hardcover', 'Paperback', 'E-book', 'Audiobook'])
    .withMessage('Invalid book format'),
  
  body('condition')
    .trim()
    .notEmpty()
    .withMessage('Book condition is required')
    .isIn(['New', 'Like New', 'Very Good', 'Good', 'Fair', 'Poor'])
    .withMessage('Invalid book condition'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer'),
  
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  
  body('discount')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be between 0 and 100'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag cannot exceed 50 characters'),
  
  handleValidationErrors
];

// Stock and price update validation
const validateStockPriceUpdate = [
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('discount')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be between 0 and 100'),
  
  body('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer'),
  
  // At least one field must be provided
  body().custom((value, { req }) => {
    const { stock, price, discount, minStock } = req.body;
    if (!stock && !price && !discount && !minStock) {
      throw new Error('At least one field (stock, price, discount, minStock) must be provided');
    }
    return true;
  }),
  
  handleValidationErrors
];

// Book ID parameter validation
const validateBookId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid book ID format'),
  
  handleValidationErrors
];

// Seller validation rules
const validateSeller = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Seller name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('address.zipCode')
    .trim()
    .notEmpty()
    .withMessage('ZIP code is required'),
  
  body('businessInfo.businessName')
    .trim()
    .notEmpty()
    .withMessage('Business name is required'),
  
  body('businessInfo.gstNumber')
    .trim()
    .notEmpty()
    .withMessage('GST number is required')
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Please provide a valid GST number'),
  
  body('businessInfo.panNumber')
    .trim()
    .notEmpty()
    .withMessage('PAN number is required')
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Please provide a valid PAN number'),
  
  body('bankDetails.accountNumber')
    .trim()
    .notEmpty()
    .withMessage('Account number is required'),
  
  body('bankDetails.ifscCode')
    .trim()
    .notEmpty()
    .withMessage('IFSC code is required')
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .withMessage('Please provide a valid IFSC code'),
  
  body('bankDetails.bankName')
    .trim()
    .notEmpty()
    .withMessage('Bank name is required'),
  
  body('bankDetails.accountHolderName')
    .trim()
    .notEmpty()
    .withMessage('Account holder name is required'),
  
  handleValidationErrors
];

// Login validation
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Image validation
const validateImages = [
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('images.*.url')
    .optional()
    .isURL()
    .withMessage('Image URL must be valid'),
  
  body('images.*.alt')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Image alt text cannot exceed 100 characters'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateBook,
  validateStockPriceUpdate,
  validateBookId,
  validateSeller,
  validateLogin,
  validateImages
};
