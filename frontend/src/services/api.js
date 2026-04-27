import axios from 'axios';

const DEFAULT_API_URL = '/api';

const isLocalhostUrl = (url) => /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(url);

const normalizeApiBaseUrl = (rawUrl) => {
  if (!rawUrl) {
    return DEFAULT_API_URL;
  }

  const trimmedUrl = rawUrl.replace(/\/+$/, '');

  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl;
  }

  // Guard against production env vars accidentally pointing to localhost.
  if (import.meta.env.PROD && isLocalhostUrl(trimmedUrl)) {
    return DEFAULT_API_URL;
  }

  return trimmedUrl.endsWith('/api') ? trimmedUrl : `${trimmedUrl}/api`;
};

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const auditAPI = {
  // Run AI bias audit
  runAudit: (data) => apiClient.post('/audit', data),
  
  // Generate PDF report — backend expects POST /generate-report with { audit_id }
  generateReport: (auditId) => apiClient.post('/generate-report', { audit_id: auditId }, {
    responseType: 'blob',
  }),
  
  // Get demo data for testing
  getDemoData: () => apiClient.get('/demo-data'),
  
  // Health check
  healthCheck: () => apiClient.get('/health'),
};

export default apiClient;
