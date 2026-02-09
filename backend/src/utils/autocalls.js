// =====================================================
// External Service Integrations
// AutoCalls white-label + Python setup service
// =====================================================

/**
 * Register user on AutoCalls platform (without plan)
 */
async function registerOnAutoCalls({ name, email, password, timezone }) {
  const AUTOCALLS_URL = 'https://app.autocalls.ai/api/white-label/register';
  const AUTOCALLS_KEY = process.env.AUTOCALLS_API_KEY;

  if (!AUTOCALLS_KEY) {
    throw new Error('AUTOCALLS_API_KEY is not set in environment variables');
  }

  const response = await fetch(AUTOCALLS_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTOCALLS_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password, timezone: timezone || 'Asia/Riyadh' }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.message || data.error || data.detail || `AutoCalls registration failed (${response.status})`;
    throw new Error(errorMsg);
  }

  // Extract API key from response (multiple possible paths)
  const apiKey = data.api_key
    || data.apiKey
    || data.token
    || data.data?.api_key
    || data.data?.apiKey
    || data.data?.token
    || data.user?.api_key
    || data.user?.apiKey
    || data.user?.token
    || '';

  return { apiKey, fullResponse: data };
}

/**
 * Setup client with plan via Python FastAPI service
 * Creates: user + assistant + imports flow
 */
async function setupClientWithPlan({ name, email, password, timezone, planId }) {
  const SETUP_URL = process.env.SETUP_SERVICE_URL || 'https://siyadah-whatsapp-saas.onrender.com';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5 * 60 * 1000); // 5 min

  try {
    const response = await fetch(`${SETUP_URL}/setup-client`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        client_name: name,
        client_email: email,
        client_password: password,
        timezone: timezone || 'Asia/Riyadh',
        plan_id: planId,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMsg = data.error || data.detail || data.message || `Setup failed (${response.status})`;
      throw new Error(errorMsg);
    }

    return { apiKey: data.user_api_key || '', fullResponse: data };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { registerOnAutoCalls, setupClientWithPlan };
