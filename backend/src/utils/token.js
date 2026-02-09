// =====================================================
// Token Utilities — Access Token (15m) + Refresh Token (7d)
// =====================================================
const jwt = require('jsonwebtoken');

// ── Access Token: short-lived, used for API calls ──
const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// ── Refresh Token: long-lived, used only to get new access tokens ──
const generateRefreshToken = (userId) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
  return jwt.sign(
    { id: userId, type: 'refresh' },
    secret,
    { expiresIn: '7d' }
  );
};

// ── Verify Refresh Token ──
const verifyRefreshToken = (token) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
  return jwt.verify(token, secret);
};

// ── Generate both tokens (used on login/register) ──
const generateTokenPair = (userId) => {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId),
  };
};

// ── Backward compatibility: old code calling generateToken ──
const generateToken = (userId) => {
  return generateAccessToken(userId);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateTokenPair,
  generateToken,
};