// =====================================================
// Moyasar API Helper — التواصل مع بوابة مُيسّر
// =====================================================
// Docs: https://docs.moyasar.com
// API Base: https://api.moyasar.com/v1
// =====================================================

const MOYASAR_API_BASE = 'https://api.moyasar.com/v1';

/**
 * Get Moyasar credentials from environment
 */
function getCredentials() {
  const secretKey = process.env.MOYASAR_SECRET_KEY;
  const publishableKey = process.env.MOYASAR_PUBLISHABLE_KEY;
  
  if (!secretKey) {
    throw new Error('MOYASAR_SECRET_KEY غير مُعد في متغيرات البيئة');
  }
  
  return { secretKey, publishableKey };
}

/**
 * Make authenticated request to Moyasar API
 * Uses Basic Auth with secret key
 */
async function moyasarRequest(endpoint, options = {}) {
  const { secretKey } = getCredentials();
  
  // Moyasar uses Basic Auth: secret_key as username, empty password
  const authHeader = 'Basic ' + Buffer.from(`${secretKey}:`).toString('base64');
  
  const url = `${MOYASAR_API_BASE}${endpoint}`;
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  });
  
  // Handle empty responses
  if (res.status === 204) return null;
  
  const data = await res.json();
  
  if (!res.ok) {
    const err = new Error(data.message || data.errors?.[0] || `Moyasar error: ${res.status}`);
    err.status = res.status;
    err.moyasarError = data;
    throw err;
  }
  
  return data;
}

// ══════════════════════════════════════════════════════
// Payment Operations
// ══════════════════════════════════════════════════════

/**
 * Fetch a payment by ID
 * GET /v1/payments/:id
 */
async function fetchPayment(paymentId) {
  return moyasarRequest(`/payments/${paymentId}`);
}

/**
 * List payments with optional filters
 * GET /v1/payments
 */
async function listPayments(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/payments?${query}` : '/payments';
  return moyasarRequest(endpoint);
}

/**
 * Refund a payment (full or partial)
 * POST /v1/payments/:id/refund
 */
async function refundPayment(paymentId, amount = null) {
  const body = amount ? { amount } : {};
  return moyasarRequest(`/payments/${paymentId}/refund`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Capture an authorized payment
 * POST /v1/payments/:id/capture
 */
async function capturePayment(paymentId, amount = null) {
  const body = amount ? { amount } : {};
  return moyasarRequest(`/payments/${paymentId}/capture`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Void/cancel an authorized payment
 * POST /v1/payments/:id/void
 */
async function voidPayment(paymentId) {
  return moyasarRequest(`/payments/${paymentId}/void`, {
    method: 'POST',
  });
}

// ══════════════════════════════════════════════════════
// Invoice Operations (Optional - for recurring)
// ══════════════════════════════════════════════════════

/**
 * Create an invoice
 * POST /v1/invoices
 */
async function createInvoice({ amount, currency = 'SAR', description, callbackUrl, expiredAt, metadata }) {
  return moyasarRequest('/invoices', {
    method: 'POST',
    body: JSON.stringify({
      amount,
      currency,
      description,
      callback_url: callbackUrl,
      expired_at: expiredAt,
      metadata,
    }),
  });
}

/**
 * Fetch an invoice by ID
 * GET /v1/invoices/:id
 */
async function fetchInvoice(invoiceId) {
  return moyasarRequest(`/invoices/${invoiceId}`);
}

// ══════════════════════════════════════════════════════
// Webhook Signature Verification
// ══════════════════════════════════════════════════════

const crypto = require('crypto');

/**
 * Verify Moyasar webhook signature
 * Moyasar sends HMAC-SHA256 signature in the header
 */
function verifyWebhookSignature(payload, signature, secret) {
  if (!secret) {
    secret = process.env.MOYASAR_WEBHOOK_SECRET;
  }
  if (!secret) {
    console.warn('[Moyasar] No webhook secret configured, skipping verification');
    return true; // Skip if no secret configured
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// ══════════════════════════════════════════════════════
// Config helper
// ══════════════════════════════════════════════════════

/**
 * Get publishable key (safe to send to frontend)
 */
function getPublishableKey() {
  return process.env.MOYASAR_PUBLISHABLE_KEY || '';
}

/**
 * Get callback URL for payment redirects
 */
function getCallbackUrl() {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${baseUrl}/payment/callback`;
}

module.exports = {
  fetchPayment,
  listPayments,
  refundPayment,
  capturePayment,
  voidPayment,
  createInvoice,
  fetchInvoice,
  verifyWebhookSignature,
  getPublishableKey,
  getCallbackUrl,
  getCredentials,
};
