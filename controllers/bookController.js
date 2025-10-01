const Book = require('../models/Book');
const Seller = require('../models/Seller');

// @desc    Create a new book
// @route   POST /api/seller/books
// @access  Private
const createBook = async (req, res) => {
  try {
    const bookData = {
      ...req.body,
      seller: req.seller._id
    };

    const book = await Book.create(bookData);

    // Populate seller information
    await book.populate('seller', 'name email businessInfo.businessName');

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    console.error('Create book error:', error);
    
    // Handle duplicate ISBN error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A book with this ISBN already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating book',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all books for a seller
// @route   GET /api/seller/books
// @access  Private
const getSellerBooks = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const {
      page = 1,
      limit = 10,
      status,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { seller: sellerId };

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const books = await Book.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('seller', 'name email businessInfo.businessName');

    // Get total count for pagination
    const totalBooks = await Book.countDocuments(query);

    res.status(200).json({
      success: true,
      count: books.length,
      totalBooks,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalBooks / parseInt(limit)),
      books
    });
  } catch (error) {
    console.error('Get seller books error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching books',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single book by ID
// @route   GET /api/seller/books/:id
// @access  Private
const getBookById = async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      seller: req.seller._id
    }).populate('seller', 'name email businessInfo.businessName');

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
  } catch (error) {
    console.error('Get book by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching book',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update book stock and price
// @route   PUT /api/seller/books/:id/stock-price
// @access  Private
const updateStockAndPrice = async (req, res) => {
  try {
    const { stock, price, discount, minStock } = req.body;
    const bookId = req.params.id;

    // Find the book and verify ownership
    const book = await Book.findOne({
      _id: bookId,
      seller: req.seller._id
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found or you do not have permission to update it'
      });
    }

    // Update fields
    const updateData = {};
    if (stock !== undefined) updateData.stock = stock;
    if (price !== undefined) updateData.price = price;
    if (discount !== undefined) updateData.discount = discount;
    if (minStock !== undefined) updateData.minStock = minStock;

    // Update status based on stock
    if (stock !== undefined) {
      if (stock === 0) {
        updateData.status = 'out_of_stock';
      } else if (book.status === 'out_of_stock' && stock > 0) {
        updateData.status = 'active';
      }
    }

    // Update the book
    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('seller', 'name email businessInfo.businessName');

    res.status(200).json({
      success: true,
      message: 'Book stock and price updated successfully',
      book: updatedBook
    });
  } catch (error) {
    console.error('Update stock and price error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating book',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update entire book
// @route   PUT /api/seller/books/:id
// @access  Private
const updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    // Find the book and verify ownership
    const book = await Book.findOne({
      _id: bookId,
      seller: req.seller._id
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found or you do not have permission to update it'
      });
    }

    // Remove seller from update data to prevent changing ownership
    const updateData = { ...req.body };
    delete updateData.seller;

    // Update the book
    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('seller', 'name email businessInfo.businessName');

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      book: updatedBook
    });
  } catch (error) {
    console.error('Update book error:', error);
    
    // Handle duplicate ISBN error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A book with this ISBN already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating book',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete book
// @route   DELETE /api/seller/books/:id
// @access  Private
const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    // Find the book and verify ownership
    const book = await Book.findOne({
      _id: bookId,
      seller: req.seller._id
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found or you do not have permission to delete it'
      });
    }

    // Delete the book
    await Book.findByIdAndDelete(bookId);

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting book',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Bulk update books status
// @route   PUT /api/seller/books/bulk/status
// @access  Private
const bulkUpdateBooksStatus = async (req, res) => {
  try {
    const { bookIds, status } = req.body;

    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Book IDs array is required'
      });
    }

    if (!status || !['draft', 'active', 'inactive', 'out_of_stock', 'discontinued'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    // Update books that belong to the seller
    const result = await Book.updateMany(
      {
        _id: { $in: bookIds },
        seller: req.seller._id
      },
      { status }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} books updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update books status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while bulk updating books',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get book analytics
// @route   GET /api/seller/books/:id/analytics
// @access  Private
const getBookAnalytics = async (req, res) => {
  try {
    const bookId = req.params.id;

    // Find the book and verify ownership
    const book = await Book.findOne({
      _id: bookId,
      seller: req.seller._id
    }).select('title author sales ratings stock status');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found or you do not have permission to view it'
      });
    }

    // Calculate analytics
    const analytics = {
      book: {
        title: book.title,
        author: book.author,
        currentStock: book.stock,
        status: book.status
      },
      sales: {
        totalSold: book.sales.totalSold,
        totalRevenue: book.sales.revenue,
        averagePrice: book.sales.totalSold > 0 ? book.sales.revenue / book.sales.totalSold : 0
      },
      ratings: {
        average: book.ratings.average,
        count: book.ratings.count
      },
      performance: {
        stockStatus: book.stock === 0 ? 'out_of_stock' : 
                    book.stock <= book.minStock ? 'low_stock' : 'in_stock',
        isLowStock: book.stock <= book.minStock && book.stock > 0
      }
    };

    res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get book analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching book analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createBook,
  getSellerBooks,
  getBookById,
  updateStockAndPrice,
  updateBook,
  deleteBook,
  bulkUpdateBooksStatus,
  getBookAnalytics
};
