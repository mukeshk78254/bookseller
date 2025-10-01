const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    match: [/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/, 'Please provide a valid ISBN']
  },
  description: {
    type: String,
    required: [true, 'Book description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 
      'Biography', 'Self-Help', 'Business', 'Education', 'Children',
      'Romance', 'Mystery', 'Thriller', 'Fantasy', 'Science Fiction',
      'Health', 'Cooking', 'Travel', 'Art', 'Religion', 'Philosophy',
      'Other'
    ]
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    default: 'English',
    enum: ['English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Other']
  },
  publisher: {
    type: String,
    required: [true, 'Publisher is required'],
    trim: true,
    maxlength: [100, 'Publisher name cannot exceed 100 characters']
  },
  publicationYear: {
    type: Number,
    required: [true, 'Publication year is required'],
    min: [1000, 'Invalid publication year'],
    max: [new Date().getFullYear(), 'Publication year cannot be in the future']
  },
  edition: {
    type: String,
    default: '1st Edition',
    trim: true
  },
  pages: {
    type: Number,
    required: [true, 'Number of pages is required'],
    min: [1, 'Book must have at least 1 page']
  },
  format: {
    type: String,
    required: [true, 'Book format is required'],
    enum: ['Hardcover', 'Paperback', 'E-book', 'Audiobook']
  },
  condition: {
    type: String,
    required: [true, 'Book condition is required'],
    enum: ['New', 'Like New', 'Very Good', 'Good', 'Fair', 'Poor']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: 'Book image'
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  minStock: {
    type: Number,
    default: 5,
    min: [0, 'Minimum stock cannot be negative']
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Seller is required']
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'out_of_stock', 'discontinued'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  },
  sales: {
    totalSold: {
      type: Number,
      default: 0,
      min: [0, 'Total sold cannot be negative']
    },
    revenue: {
      type: Number,
      default: 0,
      min: [0, 'Revenue cannot be negative']
    }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discounted price
bookSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

// Virtual for stock status
bookSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= this.minStock) return 'low_stock';
  return 'in_stock';
});

// Virtual for book age
bookSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.publicationYear;
});

// Indexes for better query performance
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ seller: 1 });
bookSchema.index({ category: 1 });
bookSchema.index({ status: 1 });
bookSchema.index({ isActive: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ 'ratings.average': -1 });
bookSchema.index({ createdAt: -1 });
bookSchema.index({ isbn: 1 });

// Compound indexes
bookSchema.index({ seller: 1, status: 1 });
bookSchema.index({ category: 1, status: 1 });
bookSchema.index({ price: 1, status: 1 });

// Pre-save middleware to ensure only one primary image
bookSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length > 1) {
      // Keep only the first primary image
      this.images.forEach((img, index) => {
        if (index > 0) img.isPrimary = false;
      });
    }
  }
  next();
});

// Method to update stock
bookSchema.methods.updateStock = function(newStock) {
  this.stock = newStock;
  
  // Update status based on stock
  if (newStock === 0) {
    this.status = 'out_of_stock';
  } else if (this.status === 'out_of_stock' && newStock > 0) {
    this.status = 'active';
  }
  
  return this.save();
};

// Method to update price
bookSchema.methods.updatePrice = function(newPrice, newDiscount = 0) {
  this.price = newPrice;
  this.discount = newDiscount;
  return this.save();
};

// Method to add sale
bookSchema.methods.addSale = function(quantity, unitPrice) {
  this.sales.totalSold += quantity;
  this.sales.revenue += (quantity * unitPrice);
  this.stock -= quantity;
  
  if (this.stock === 0) {
    this.status = 'out_of_stock';
  }
  
  return this.save();
};

// Static method to find books by seller
bookSchema.statics.findBySeller = function(sellerId, options = {}) {
  return this.find({ seller: sellerId, ...options }).populate('seller', 'name email businessInfo.businessName');
};

// Static method to find active books
bookSchema.statics.findActive = function(options = {}) {
  return this.find({ status: 'active', isActive: true, stock: { $gt: 0 }, ...options });
};

module.exports = mongoose.model('Book', bookSchema);
