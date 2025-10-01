const jwt = require('jsonwebtoken');
const Seller = require('../models/Seller');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please provide a valid token.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get seller from token
      const seller = await Seller.findById(decoded.id).select('-password');
      
      if (!seller) {
        return res.status(401).json({
          success: false,
          message: 'No seller found with this token'
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

      req.seller = seller;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Invalid token.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Grant access to specific roles (if needed in future)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.seller) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // For now, all sellers have the same permissions
    // In future, you can add role-based access control
    next();
  };
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const seller = await Seller.findById(decoded.id).select('-password');
        
        if (seller && seller.isActive && seller.status === 'approved') {
          req.seller = seller;
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Optional auth: Invalid token');
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue even if there's an error
  }
};

module.exports = {
  protect,
  authorize,
  optionalAuth
};
