import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const auditAPI = {
  // Run AI bias audit
  runAudit: (data) => apiClient.post('/audit', data),
  
  // Get mitigation strategies
  getMitigations: (auditId) => apiClient.get(`/mitigations/${auditId}`),
  
  // Generate PDF report
  generateReport: (auditId) => apiClient.get(`/report/${auditId}`, {
    responseType: 'blob',
  }),
  
  // Get demo data for testing
  getDemoData: () => apiClient.get('/demo-data'),
  
  // Health check
  healthCheck: () => apiClient.get('/health'),
};

export default apiClient;
