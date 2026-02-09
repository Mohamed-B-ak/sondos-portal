// =====================================================
// Sondos AI API - Complete Integration v3.0 (SECURE)
// ─────────────────────────────────────────────────────
// All requests go through Backend proxy.
// API Key NEVER leaves the server.
// Frontend authenticates with auth_token only.
// =====================================================

const BACKEND_API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SONDOS_PROXY_BASE = `${BACKEND_API_BASE}/sondos`;

// ==================== Auth Token Helper ====================

const getAuthToken = () => localStorage.getItem('auth_token');

// ==================== API Key Management ====================
// Keys are stored in the Backend DB only.
// Frontend only caches a flag (hasKey) for UI purposes.

// Check if user has an API key (from user object in localStorage)
export const hasApiKey = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    const user = JSON.parse(userStr);
    return !!(user.sondosApiKey || user.api_key);
  } catch {
    return false;
  }
};

// Save API key to backend
export const setApiKey = async (apiKey) => {
  const token = getAuthToken();
  if (!token) return;

  try {
    await fetch(`${BACKEND_API_BASE}/user/sondos-key`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });

    // Update cached user object
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.sondosApiKey = apiKey;
      localStorage.setItem('user', JSON.stringify(user));
    }
  } catch (error) {
    console.error('Failed to save API key:', error);
  }
};

// Clear API key
export const clearApiKey = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      user.sondosApiKey = '';
      localStorage.setItem('user', JSON.stringify(user));
    } catch { /* silent */ }
  }
};

// Get masked API key for display
export const getMaskedApiKey = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    const key = user.sondosApiKey || user.api_key || '';
    if (!key || key.length <= 8) return key ? '****' : null;
    return key.substring(0, 4) + '****' + key.substring(key.length - 4);
  } catch {
    return null;
  }
};

// Fetch API key status from backend
export const fetchApiKeyFromBackend = async () => {
  try {
    const token = getAuthToken();
    if (!token) return null;

    const response = await fetch(`${BACKEND_API_BASE}/user/sondos-key`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data.apiKey) {
        // Update cached user object
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.sondosApiKey = data.data.apiKey;
          localStorage.setItem('user', JSON.stringify(user));
        }
        return data.data.apiKey;
      }
    }
    return null;
  } catch {
    return null;
  }
};

export const getApiKeyWithFallback = async () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.sondosApiKey || user.api_key) return user.sondosApiKey || user.api_key;
    }
  } catch { /* silent */ }
  return await fetchApiKeyFromBackend();
};

// ==================== Core API Helper ====================
// All requests go to Backend proxy: /api/sondos/*
// Backend reads API key from DB and forwards to Sondos API

async function sondosApiCall(endpoint, options = {}) {
  // /user/assistants → BACKEND/api/sondos/user/assistants
  const url = `${SONDOS_PROXY_BASE}${endpoint}`;
  const token = getAuthToken();

  if (!token) {
    throw new Error('غير مصرح — يرجى تسجيل الدخول');
  }

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 204) {
      return { success: true };
    }

    // Session expired — redirect to login
    if (response.status === 401) {
      throw new Error('الجلسة منتهية — يرجى تسجيل الدخول');
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 422 && data.errors) {
        const errorMessages = [];
        for (const [field, messages] of Object.entries(data.errors)) {
          if (Array.isArray(messages)) {
            errorMessages.push(`${field}: ${messages.join(', ')}`);
          } else {
            errorMessages.push(`${field}: ${messages}`);
          }
        }
        throw new Error(errorMessages.join('\n') || 'خطأ في البيانات المدخلة');
      }
      throw new Error(data.message || data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Helper for file uploads (multipart/form-data)
async function sondosApiUpload(endpoint, formData) {
  const url = `${SONDOS_PROXY_BASE}${endpoint}`;
  const token = getAuthToken();

  if (!token) {
    throw new Error('غير مصرح — يرجى تسجيل الدخول');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      // Don't set Content-Type — browser sets it with boundary for FormData
    },
    body: formData,
  });

  if (response.status === 401) {
    throw new Error('الجلسة منتهية — يرجى تسجيل الدخول');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP ${response.status}`);
  }

  return data;
}

// ==================== Validate API Key ====================

export const validateApiKey = async (apiKey) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${SONDOS_PROXY_BASE}/validate-key`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });

    const data = await response.json();
    if (data.success && data.valid) {
      return { valid: true, user: data.user };
    }
    return { valid: false, error: data.message || 'مفتاح API غير صالح' };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// ==================== User API ====================
// Docs: https://docs.sondos-ai.com/api-reference/user/me

export const userAPI = {
  // Get current authenticated user
  me: async () => sondosApiCall('/user/me'),
};

// ==================== Assistants API ====================
// Docs: https://docs.sondos-ai.com/api-reference/assistants

export const assistantsAPI = {
  // List all assistants
  // GET /api/user/assistants
  getAll: async () => sondosApiCall('/user/assistants'),
  
  // Get outbound assistants only
  // GET /api/user/assistants/outbound
  getOutbound: async () => sondosApiCall('/user/assistants/outbound'),
  
  // Get single assistant by ID
  // GET /api/user/assistant/{id}
  get: async (id) => sondosApiCall(`/user/assistant/${id}`),
  
  // Create new assistant
  // POST /api/user/assistant
  // Required: assistant_name, system_prompt, language, voice_id
  create: async (data) => sondosApiCall('/user/assistant', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Update assistant (try PUT first, some APIs prefer this)
  // PUT /api/user/assistant/{id}
  update: async (id, data) => {
    try {
      return await sondosApiCall(`/user/assistant/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      // If PUT fails with 500, try PATCH as fallback
      if (error.message?.includes('500') || error.message?.includes('failed')) {
        return await sondosApiCall(`/user/assistant/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      }
      throw error;
    }
  },
  
  // Partial update assistant
  // PATCH /api/user/assistant/{id}
  patch: async (id, data) => sondosApiCall(`/user/assistant/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  
  // Delete assistant
  // DELETE /api/user/assistant/{id}
  delete: async (id) => sondosApiCall(`/user/assistant/${id}`, {
    method: 'DELETE',
  }),
  
  // Enable inbound webhook for assistant
  // POST /api/user/assistant/{id}/enable-inbound-webhook
  enableInboundWebhook: async (id, webhookUrl) => sondosApiCall(`/user/assistant/${id}/enable-inbound-webhook`, {
    method: 'POST',
    body: JSON.stringify({ webhook_url: webhookUrl }),
  }),
  
  // Disable inbound webhook
  // POST /api/user/assistant/{id}/disable-inbound-webhook
  disableInboundWebhook: async (id) => sondosApiCall(`/user/assistant/${id}/disable-inbound-webhook`, {
    method: 'POST',
  }),
  
  // Disable webhook (post-call)
  // POST /api/user/assistant/{id}/disable-webhook
  disableWebhook: async (id) => sondosApiCall(`/user/assistant/${id}/disable-webhook`, {
    method: 'POST',
  }),
  
  // Get available voices
  // GET /api/user/assistants/voices
  getVoices: async () => sondosApiCall('/user/assistants/voices'),
  
  // Get available languages
  // GET /api/user/assistants/languages
  getLanguages: async () => sondosApiCall('/user/assistants/languages'),
  
  // Get available LLM models
  // GET /api/user/assistants/models
  getModels: async () => sondosApiCall('/user/assistants/models'),
  
  // Get available phone numbers for assistants
  // GET /api/user/assistants/phone-numbers
  getPhoneNumbers: async () => sondosApiCall('/user/assistants/phone-numbers'),
};

// ==================== Calls API ====================
// Docs: https://docs.sondos-ai.com/api-reference/calls

export const callsAPI = {
  // List all calls with optional filters
  // Params: status, type, phone_number, assistant_id, campaign_id, date_from, date_to, per_page, page
  // Status values: initiated, ringing, busy, in-progress, ended, completed, ended_by_customer, ended_by_assistant, no-answer, failed
  // Type values: inbound, outbound, web
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return sondosApiCall(`/user/calls${query ? `?${query}` : ''}`);
  },
  
  // Get single call by ID
  get: async (id) => sondosApiCall(`/user/calls/${id}`),
  
  // Make a phone call
  // POST /api/user/make_call
  // Required: assistant_id, phone_number
  // Optional: variables (object with customer_name, email, etc.)
  // Docs: https://docs.sondos-ai.com/api-reference/calls/make-phone-call
  makeCall: async (callData) => sondosApiCall('/user/make_call', {
    method: 'POST',
    body: JSON.stringify(callData),
  }),
  
  // Delete call
  delete: async (callId) => sondosApiCall(`/user/calls/${callId}`, {
    method: 'DELETE',
  }),
};

// ==================== Conversations API ====================
// Docs: https://docs.sondos-ai.com/api-reference/conversations

export const conversationsAPI = {
  // List all conversations
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return sondosApiCall(`/user/conversations${query ? `?${query}` : ''}`);
  },
  
  // Get single conversation
  get: async (id) => sondosApiCall(`/user/conversations/${id}`),
};

// ==================== AI API ====================
// Docs: https://docs.sondos-ai.com/api-reference/ai

export const aiAPI = {
  // Chat completion
  chat: async (messages, options = {}) => sondosApiCall('/user/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, ...options }),
  }),
  
  // Text to speech
  tts: async (text, voiceId) => sondosApiCall('/user/ai/tts', {
    method: 'POST',
    body: JSON.stringify({ text, voice_id: voiceId }),
  }),
  
  // Speech to text
  stt: async (audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    return sondosApiUpload('/user/ai/stt', formData);
  },
};

// ==================== Mid-Call Tools API ====================
// Docs: https://docs.sondos-ai.com/api-reference/mid-call-tools

export const midCallToolsAPI = {
  // List all mid-call tools
  getAll: async () => sondosApiCall('/user/mid-call-tools'),
  
  // Get single tool
  get: async (id) => sondosApiCall(`/user/mid-call-tools/${id}`),
  
  // Create tool
  create: async (data) => sondosApiCall('/user/mid-call-tools', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Update tool
  update: async (id, data) => sondosApiCall(`/user/mid-call-tools/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Delete tool
  delete: async (id) => sondosApiCall(`/user/mid-call-tools/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== Leads API ====================
// Docs: https://docs.sondos-ai.com/api-reference/leads

export const leadsAPI = {
  // List all leads
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return sondosApiCall(`/user/leads${query ? `?${query}` : ''}`);
  },
  
  // Get single lead
  get: async (id) => sondosApiCall(`/user/leads/${id}`),
  
  // Create lead
  create: async (data) => {
    // Transform flat data to API format
    const { phone_number, name, email, campaign_id, ...rest } = data;
    const payload = {
      phone_number,
      allow_dupplicate: true,
      variables: {}
    };
    if (campaign_id) payload.campaign_id = Number(campaign_id);
    if (name) payload.variables.customer_name = name;
    if (email) payload.variables.email = email;
    // Add any extra custom fields to variables
    Object.keys(rest).forEach(key => {
      if (key !== 'campaign_id') payload.variables[key] = rest[key];
    });
    return sondosApiCall('/user/lead', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  
  // Update lead
  update: async (id, data) => sondosApiCall(`/user/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Delete lead
  delete: async (id) => sondosApiCall(`/user/leads/${id}`, {
    method: 'DELETE',
  }),
  
  // Import leads from CSV
  importCSV: async (file, campaignId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('campaign_id', campaignId);
    return sondosApiUpload('/user/leads/import', formData);
  },
};

// ==================== Campaigns API ====================
// Docs: https://docs.sondos-ai.com/api-reference/campaigns

export const campaignsAPI = {
  // List all campaigns
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return sondosApiCall(`/user/campaigns${query ? `?${query}` : ''}`);
  },
  
  // Get single campaign
  get: async (id) => sondosApiCall(`/user/campaigns/${id}`),
  
  // Create campaign
  create: async (data) => sondosApiCall('/user/campaigns', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Update campaign
  update: async (id, data) => sondosApiCall(`/user/campaigns/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Delete campaign
  delete: async (id) => sondosApiCall(`/user/campaigns/${id}`, {
    method: 'DELETE',
  }),
  
  // Start campaign
  start: async (id) => sondosApiCall('/user/campaigns/update-status', {
    method: 'POST',
    body: JSON.stringify({ campaign_id: Number(id), action: 'start' }),
  }),
  
  // Pause campaign
  pause: async (id) => sondosApiCall('/user/campaigns/update-status', {
    method: 'POST',
    body: JSON.stringify({ campaign_id: Number(id), action: 'stop' }),
  }),
  
  // Stop campaign
  stop: async (id) => sondosApiCall('/user/campaigns/update-status', {
    method: 'POST',
    body: JSON.stringify({ campaign_id: Number(id), action: 'stop' }),
  }),
};

// ==================== Phone Numbers API ====================
// Docs: https://docs.sondos-ai.com/api-reference/phone-numbers

export const phoneNumbersAPI = {
  // List all phone numbers
  getAll: async () => sondosApiCall('/user/phone-numbers'),
  
  // Get single phone number
  get: async (id) => sondosApiCall(`/user/phone-numbers/${id}`),
  
  // Update phone number
  update: async (id, data) => sondosApiCall(`/user/phone-numbers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// ==================== Knowledge Bases API ====================
// Docs: https://docs.sondos-ai.com/api-reference/knowledgebases

export const knowledgebasesAPI = {
  // List all knowledge bases
  getAll: async () => sondosApiCall('/user/knowledgebases'),
  
  // Get single knowledge base
  get: async (id) => sondosApiCall(`/user/knowledgebases/${id}`),
  
  // Create knowledge base
  create: async (data) => sondosApiCall('/user/knowledgebases', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Update knowledge base
  update: async (id, data) => sondosApiCall(`/user/knowledgebases/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Delete knowledge base
  delete: async (id) => sondosApiCall(`/user/knowledgebases/${id}`, {
    method: 'DELETE',
  }),
  
  // ==================== Documents ====================
  
  // Get all documents in a knowledge base
  getDocuments: async (kbId) => sondosApiCall(`/user/knowledgebases/${kbId}/documents`),
  
  // Get single document
  getDocument: async (kbId, docId) => sondosApiCall(`/user/knowledgebases/${kbId}/documents/${docId}`),
  
  // Create document in knowledge base (JSON - for website type)
  // type: 'website'
  // For single URL: { name, description, type: 'website', url: 'https://...', relative_links_limit: 10 }
  // For multiple links: { name, description, type: 'website', links: [{link: 'url1'}, {link: 'url2'}], relative_links_limit: 10 }
  createDocument: async (kbId, data) => sondosApiCall(`/user/knowledgebases/${kbId}/documents`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Upload file document (PDF, TXT, DOCX)
  // type: 'pdf', 'txt', or 'docx'
  // file: File object from input
  uploadDocument: async (kbId, name, description, type, file) => {
    const formData = new FormData();
    formData.append('name', name);
    if (description) formData.append('description', description);
    formData.append('type', type);
    formData.append('file', file);
    return sondosApiUpload(`/user/knowledgebases/${kbId}/documents`, formData);
  },
  
  // Update document
  updateDocument: async (kbId, docId, data) => sondosApiCall(`/user/knowledgebases/${kbId}/documents/${docId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Delete document
  deleteDocument: async (kbId, docId) => sondosApiCall(`/user/knowledgebases/${kbId}/documents/${docId}`, {
    method: 'DELETE',
  }),
  
  // ==================== Files (Legacy) ====================
  
  // Upload file to knowledge base
  uploadFile: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return sondosApiUpload(`/user/knowledgebases/${id}/files`, formData);
  },
  
  // Delete file from knowledge base
  deleteFile: async (kbId, fileId) => sondosApiCall(`/user/knowledgebases/${kbId}/files/${fileId}`, {
    method: 'DELETE',
  }),
};

// ==================== SMS API ====================
// Docs: https://docs.sondos-ai.com/api-reference/sms

export const smsAPI = {
  // Send SMS
  // Required: to (phone number), message
  // Optional: from (phone number to send from)
  send: async (to, message, from = null) => sondosApiCall('/user/sms', {
    method: 'POST',
    body: JSON.stringify({ to, message, from }),
  }),
  
  // Send bulk SMS
  sendBulk: async (messages) => sondosApiCall('/user/sms/bulk', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  }),
};

// ==================== API Keys API ====================
// Docs: https://docs.sondos-ai.com/api-reference/authentication

export const apiKeysAPI = {
  // List all API keys
  getAll: async () => sondosApiCall('/user/api-keys'),
  
  // Create new API key
  create: async (name) => sondosApiCall('/user/api-keys', {
    method: 'POST',
    body: JSON.stringify({ name }),
  }),
  
  // Delete API key
  delete: async (id) => sondosApiCall(`/user/api-keys/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== Webhooks Reference ====================
// Post-Call Webhook payload structure
// Docs: https://docs.sondos-ai.com/api-reference/webhooks/post-call-webhook

export const WEBHOOK_EVENTS = {
  CALL_COMPLETED: 'call.completed',
  CALL_STARTED: 'call.started',
  CALL_FAILED: 'call.failed',
};

export const webhookPayloadExample = {
  event: 'call.completed',
  call: {
    id: 123,
    assistant_id: 1,
    assistant_name: 'Sales Assistant',
    campaign_id: 1,
    campaign_name: 'Q4 Outreach',
    type: 'outbound', // inbound, outbound, web
    status: 'completed',
    duration: 245,
    assistant_phone_number: '+1234567890',
    client_phone_number: '+1987654321',
    transcript: 'Full conversation transcript...',
    recording_url: 'https://recordings.sondos-ai.com/calls/123.mp3',
    variables: {
      customer_name: 'John Doe',
    },
    evaluation: {
      sentiment: 'positive',
      outcome: 'qualified_lead',
      score: 8.5,
    },
    carrier_cost: 0.02,
    total_cost: 0.025,
    answered_by: 'human',
    created_at: '2025-01-29 10:30:00',
    updated_at: '2025-01-29 10:35:00',
  },
};

// ==================== Tools/Integrations API ====================
// Docs: https://docs.sondos-ai.com/api-reference/tools

export const toolsAPI = {
  // List all tools
  getAll: async () => sondosApiCall('/user/tools'),
  
  // Get single tool
  get: async (id) => sondosApiCall(`/user/tools/${id}`),
  
  // Create tool
  // Required: name, description, endpoint, method
  // Optional: timeout, headers[], schema[]
  create: async (data) => sondosApiCall('/user/tools', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Update tool
  update: async (id, data) => sondosApiCall(`/user/tools/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Delete tool
  delete: async (id) => sondosApiCall(`/user/tools/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== Constants ====================

export const CALL_STATUSES = {
  INITIATED: 'initiated',
  RINGING: 'ringing',
  BUSY: 'busy',
  IN_PROGRESS: 'in-progress',
  ENDED: 'ended',
  COMPLETED: 'completed',
  ENDED_BY_CUSTOMER: 'ended_by_customer',
  ENDED_BY_ASSISTANT: 'ended_by_assistant',
  NO_ANSWER: 'no-answer',
  FAILED: 'failed',
};

export const CALL_TYPES = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
  WEB: 'web',
};

export const LEAD_STATUSES = {
  CREATED: 'created',
  COMPLETED: 'completed',
  REACHED_MAX_RETRIES: 'reached-max-retries',
  FAILED: 'failed',
  IN_PROGRESS: 'in-progress',
  SCHEDULED: 'scheduled',
};

export const CAMPAIGN_STATUSES = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  DRAFT: 'draft',
};

// ==================== Utility Functions ====================

// Parse pagination from API response
export const parsePagination = (response) => ({
  currentPage: response.current_page || 1,
  lastPage: response.last_page || 1,
  perPage: response.per_page || 15,
  total: response.total || 0,
  from: response.from || 0,
  to: response.to || 0,
  data: response.data || [],
});

// Format phone number to E.164 (Saudi Arabia default)
export const formatPhoneE164 = (phone, countryCode = '966') => {
  if (!phone) return '';
  
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // Remove leading zeros
  cleaned = cleaned.replace(/^0+/, '');
  
  // Add country code if not present
  if (!cleaned.startsWith(countryCode) && !cleaned.startsWith('1')) {
    cleaned = countryCode + cleaned;
  }
  
  return '+' + cleaned;
};

// Parse call duration to human readable
export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '-';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('ar-SA');
  } catch {
    return dateString;
  }
};

// Format datetime for display
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleString('ar-SA');
  } catch {
    return dateString;
  }
};

// Get status color class (Tailwind)
export const getStatusColor = (status) => {
  const colors = {
    // Call statuses
    completed: 'bg-emerald-500/10 text-emerald-500',
    ended: 'bg-emerald-500/10 text-emerald-500',
    ended_by_customer: 'bg-emerald-500/10 text-emerald-500',
    ended_by_assistant: 'bg-emerald-500/10 text-emerald-500',
    'no-answer': 'bg-red-500/10 text-red-500',
    failed: 'bg-red-500/10 text-red-500',
    busy: 'bg-orange-500/10 text-orange-500',
    'in-progress': 'bg-yellow-500/10 text-yellow-500',
    ringing: 'bg-blue-500/10 text-blue-500',
    initiated: 'bg-gray-500/10 text-gray-500',
    // Lead statuses
    created: 'bg-blue-500/10 text-blue-500',
    'reached-max-retries': 'bg-orange-500/10 text-orange-500',
    scheduled: 'bg-purple-500/10 text-purple-500',
    // Campaign statuses
    active: 'bg-emerald-500/10 text-emerald-500',
    paused: 'bg-yellow-500/10 text-yellow-500',
    stopped: 'bg-red-500/10 text-red-500',
    draft: 'bg-gray-500/10 text-gray-500',
  };
  return colors[status] || 'bg-gray-500/10 text-gray-500';
};

// Get call type color class (Tailwind)
export const getTypeColor = (type) => {
  const colors = {
    inbound: 'bg-blue-500/10 text-blue-500',
    outbound: 'bg-purple-500/10 text-purple-500',
    web: 'bg-cyan-500/10 text-cyan-500',
  };
  return colors[type] || 'bg-gray-500/10 text-gray-500';
};

// Check if call is answered
export const isCallAnswered = (status) => {
  return ['completed', 'ended', 'ended_by_customer', 'ended_by_assistant'].includes(status);
};

// Check if call is missed
export const isCallMissed = (status) => {
  return ['no-answer', 'failed', 'busy'].includes(status);
};

// Check if call is in progress
export const isCallInProgress = (status) => {
  return ['initiated', 'ringing', 'in-progress'].includes(status);
};

// Get lead name from variables
export const getLeadName = (lead) => {
  if (!lead) return 'Unknown';
  if (lead.variables?.customer_name) return lead.variables.customer_name;
  if (lead.variables?.name) return lead.variables.name;
  if (lead.variables?.full_name) return lead.variables.full_name;
  return `Lead #${lead.id}`;
};

// Get lead email from variables
export const getLeadEmail = (lead) => {
  return lead?.variables?.email || null;
};

// ==================== Default Export ====================

export default {
  // API Key Management
  setApiKey,
  hasApiKey,
  clearApiKey,
  getMaskedApiKey,
  validateApiKey,
  fetchApiKeyFromBackend,
  getApiKeyWithFallback,
  
  // APIs
  user: userAPI,
  assistants: assistantsAPI,
  calls: callsAPI,
  conversations: conversationsAPI,
  ai: aiAPI,
  midCallTools: midCallToolsAPI,
  leads: leadsAPI,
  campaigns: campaignsAPI,
  phoneNumbers: phoneNumbersAPI,
  knowledgebases: knowledgebasesAPI,
  sms: smsAPI,
  apiKeys: apiKeysAPI,
  tools: toolsAPI,
  
  // Constants
  CALL_STATUSES,
  CALL_TYPES,
  LEAD_STATUSES,
  CAMPAIGN_STATUSES,
  WEBHOOK_EVENTS,
  
  // Utilities
  parsePagination,
  formatPhoneE164,
  formatDuration,
  formatDate,
  formatDateTime,
  getStatusColor,
  getTypeColor,
  isCallAnswered,
  isCallMissed,
  isCallInProgress,
  getLeadName,
  getLeadEmail,
};