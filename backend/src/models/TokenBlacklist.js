// =====================================================
// Token Blacklist — Revoked refresh tokens (auto-cleanup via TTL)
// =====================================================
const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  reason: {
    type: String,
    enum: ['logout', 'password_change', 'admin_revoke'],
    default: 'logout',
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // MongoDB TTL: auto-delete when expired
  },
}, {
  timestamps: true,
});

// ── Check if a token is blacklisted ──
tokenBlacklistSchema.statics.isBlacklisted = async function (token) {
  const entry = await this.findOne({ token });
  return !!entry;
};

// ── Blacklist a single token ──
tokenBlacklistSchema.statics.revokeToken = async function (token, userId, reason = 'logout') {
  // Refresh tokens expire in 7d, so blacklist entry lives 7 days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return this.create({ token, userId, reason, expiresAt });
};

// ── Blacklist ALL tokens for a user (password change / admin revoke) ──
tokenBlacklistSchema.statics.revokeAllForUser = async function (userId, reason = 'password_change') {
  // We mark user's passwordChangedAt instead (checked in auth middleware)
  // This is more efficient than blacklisting all tokens
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(userId, { tokenVersion: Date.now() });
};

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
