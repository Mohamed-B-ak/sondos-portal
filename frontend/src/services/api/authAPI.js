import { apiCall, getToken, setToken, clearAllAuth, setOnAuthFailed } from './httpClient';

// Re-export for use by AuthProvider
export { getToken, clearAllAuth, setOnAuthFailed };

// User storage helpers
const setStoredUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
};

export const authAPI = {
  register: async (userData) => {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (response.success && response.data) {
      setToken(response.data.token);
      setStoredUser(response.data.user);
    }
    return response;
  },

  /**
   * Register WITH payment — calls siyadah to setup account + plan
   * Flow: Moyasar payment completed → verify + create user + setup on siyadah
   */
  registerWithPayment: async (userData) => {
    const response = await apiCall('/auth/register-with-payment', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (response.success && response.data) {
      setToken(response.data.token);
      setStoredUser(response.data.user);
    }
    return response;
  },

  login: async (email, password) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.success && response.data) {
      setToken(response.data.token);
      setStoredUser(response.data.user);
    }
    return response;
  },

  logout: () => clearAllAuth(),

  me: async () => apiCall('/auth/me'),

  updateProfile: async (profileData) => {
    const response = await apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    if (response.success && response.data) setStoredUser(response.data);
    return response;
  },

  changePassword: async (currentPassword, newPassword) => {
    return apiCall('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  saveSondosApiKey: async (apiKey) => {
    return apiCall('/auth/sondos-key', {
      method: 'PUT',
      body: JSON.stringify({ apiKey }),
    });
  },

  getUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/auth/users${query ? `?${query}` : ''}`);
  },

  updateUserStatus: async (userId, isActive) => {
    return apiCall(`/auth/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  },
};

export default authAPI;