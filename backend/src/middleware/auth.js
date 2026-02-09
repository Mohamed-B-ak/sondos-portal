// =====================================================
// Auth Middleware — Token verification + Blacklist check
// =====================================================
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');

// ── Protect routes — verify access token ──
const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح - يرجى تسجيل الدخول'
    });
  }

  try {
    // 1. Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Ensure it's an access token (not a refresh token)
    if (decoded.type && decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'نوع التوكن غير صالح'
      });
    }

    // 3. Get user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'الحساب معطل'
      });
    }

    // 4. Check if token was issued before a password change / revoke-all
    //    tokenVersion is updated when password changes or admin revokes all
    if (user.tokenVersion && decoded.iat) {
      const tokenIssuedAt = decoded.iat * 1000; // JWT iat is in seconds
      if (tokenIssuedAt < user.tokenVersion) {
        return res.status(401).json({
          success: false,
          message: 'الجلسة منتهية — يرجى تسجيل الدخول مرة أخرى'
        });
      }
    }

    // 5. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    // Differentiate between expired and invalid
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'انتهت صلاحية الجلسة — يرجى تحديث التوكن',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'جلسة غير صالحة — يرجى تسجيل الدخول مرة أخرى'
    });
  }
};

// ── Admin only ──
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'غير مصرح - للمديرين فقط'
    });
  }
};

module.exports = { protect, adminOnly };