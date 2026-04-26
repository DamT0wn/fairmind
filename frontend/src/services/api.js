import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
