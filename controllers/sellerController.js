const Seller = require('../models/Seller');
const Book = require('../models/Book');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register seller
// @route   POST /api/seller/register
// @access  Public
const registerSeller = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      businessInfo,
      bankDetails
    } = req.body;

    // Check if seller already exists
    const existingSeller = await Seller.findOne({
      $or: [
        { email },
        { 'businessInfo.gstNumber': businessInfo.gstNumber },
        { 'businessInfo.panNumber': businessInfo.panNumber }
      ]
    });

    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: 'Seller already exists with this email, GST number, or PAN number'
      });
    }

    // Create seller
    const seller = await Seller.create({
      name,
      email,
      password,
      phone,
      address,
      businessInfo,
      bankDetails
    });

    // Generate token
    const token = generateToken(seller._id);

    // Set cookie options
    const options = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res.status(201).cookie('token', token, options).json({
      success: true,
      message: 'Seller registered successfully. Please wait for approval.',
      token,
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        status: seller.status,
        businessName: seller.businessInfo.businessName
      }
    });
  } catch (error) {
    console.error('Register seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login seller
// @route   POST /api/seller/login
// @access  Public
const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if seller exists and include password for comparison
    const seller = await Seller.findOne({ email }).select('+password');

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if seller is active
    if (!seller.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check if seller is approved
    if (seller.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your seller account is not approved yet. Please wait for approval.'
      });
    }

    // Check password
    const isPasswordMatch = await seller.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await seller.updateLastLogin();

    // Generate token
    const token = generateToken(seller._id);

    // Set cookie options
    const options = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res.status(200).cookie('token', token, options).json({
      success: true,
      message: 'Login successful',
      token,
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        status: seller.status,
        businessName: seller.businessInfo.businessName,
        lastLogin: seller.lastLogin
      }
    });
  } catch (error) {
    console.error('Login seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current seller profile
// @route   GET /api/seller/profile
// @access  Private
const getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller._id).select('-password');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.status(200).json({
      success: true,
      seller
    });
  } catch (error) {
    console.error('Get seller profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update seller profile
// @route   PUT /api/seller/profile
// @access  Private
const updateSellerProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      businessInfo,
      bankDetails,
      profileImage
    } = req.body;

    const updateData = {};
    
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (businessInfo) updateData.businessInfo = businessInfo;
    if (bankDetails) updateData.bankDetails = bankDetails;
    if (profileImage) updateData.profileImage = profileImage;

    const seller = await Seller.findByIdAndUpdate(
      req.seller._id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      seller
    });
  } catch (error) {
    console.error('Update seller profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Logout seller
// @route   POST /api/seller/logout
// @access  Private
const logoutSeller = async (req, res) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // 10 seconds
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get seller dashboard stats
// @route   GET /api/seller/dashboard
// @access  Private
const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.seller._id;

    // Get total books count
    const totalBooks = await Book.countDocuments({ seller: sellerId });

    // Get active books count
    const activeBooks = await Book.countDocuments({ 
      seller: sellerId, 
      status: 'active',
      isActive: true 
    });

    // Get out of stock books count
    const outOfStockBooks = await Book.countDocuments({ 
      seller: sellerId, 
      status: 'out_of_stock' 
    });

    // Get total sales and revenue
    const salesStats = await Book.aggregate([
      { $match: { seller: sellerId } },
      {
        $group: {
          _id: null,
          totalSold: { $sum: '$sales.totalSold' },
          totalRevenue: { $sum: '$sales.revenue' }
        }
      }
    ]);

    // Get recent books
    const recentBooks = await Book.find({ seller: sellerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title author price stock status createdAt');

    // Get low stock books
    const lowStockBooks = await Book.find({
      seller: sellerId,
      $expr: { $lte: ['$stock', '$minStock'] },
      stock: { $gt: 0 }
    })
    .select('title author stock minStock')
    .limit(5);

    const stats = {
      totalBooks,
      activeBooks,
      outOfStockBooks,
      totalSold: salesStats[0]?.totalSold || 0,
      totalRevenue: salesStats[0]?.totalRevenue || 0,
      recentBooks,
      lowStockBooks
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get seller dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  registerSeller,
  loginSeller,
  getSellerProfile,
  updateSellerProfile,
  logoutSeller,
  getSellerDashboard
};
