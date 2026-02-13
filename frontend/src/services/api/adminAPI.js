// =====================================================
// Admin API Service — Dashboard, Users, Balance Transfer
// =====================================================
import { apiCall } from './httpClient';

export const adminAPI = {
  // ── Dashboard ──
  getDashboard: () => apiCall('/admin/dashboard'),

  // ── Balance Transfer (AutoCalls White-Label) ──
  transferBalance: (data) => apiCall('/admin/transfer-balance', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // ── Users ──
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/admin/users${query ? `?${query}` : ''}`);
  },

  getUser: (id) => apiCall(`/admin/users/${id}`),

  updateUser: (id, data) => apiCall(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  updateUserStatus: (id, isActive) => apiCall(`/admin/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ isActive }),
  }),

  deleteUser: (id) => apiCall(`/admin/users/${id}`, {
    method: 'DELETE',
  }),
};

export default adminAPI;
