// =====================================================
// Payment API Service — تواصل الفرونت مع باك إند المدفوعات
// =====================================================
import { apiCall } from './httpClient';

export const paymentAPI = {
  /**
   * Get payment config (publishable key + plans)
   */
  getConfig: () => apiCall('/payments/config'),

  /**
   * Create a new payment
   * @param {Object} data - { planId, type: 'subscription'|'topup'|'one_time', amount? }
   */
  createPayment: (data) => apiCall('/payments/create', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  /**
   * Verify payment after Moyasar redirect
   * @param {string} paymentId - Our internal payment ID
   * @param {string} moyasarPaymentId - Moyasar's payment ID
   */
  verifyPayment: (paymentId, moyasarPaymentId) => apiCall('/payments/verify', {
    method: 'POST',
    body: JSON.stringify({ paymentId, moyasarPaymentId }),
  }),

  /**
   * Get payment history
   * @param {Object} params - { page, limit, status }
   */
  getHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/payments/history${query ? `?${query}` : ''}`);
  },

  /**
   * Get current subscription
   */
  getSubscription: () => apiCall('/payments/subscription'),
};

export default paymentAPI;
