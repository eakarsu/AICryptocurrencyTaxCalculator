import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
};

export const transactions = {
  getAll: () => API.get('/transactions'),
  getOne: (id) => API.get(`/transactions/${id}`),
  create: (data) => API.post('/transactions', data),
  update: (id, data) => API.put(`/transactions/${id}`, data),
  delete: (id) => API.delete(`/transactions/${id}`),
  aiClassify: (data) => API.post('/transactions/ai/classify', data),
};

export const portfolio = {
  getAll: () => API.get('/portfolio'),
  getOne: (id) => API.get(`/portfolio/${id}`),
  create: (data) => API.post('/portfolio', data),
  update: (id, data) => API.put(`/portfolio/${id}`, data),
  delete: (id) => API.delete(`/portfolio/${id}`),
  aiAnalyze: () => API.post('/portfolio/ai/analyze'),
};

export const taxReports = {
  getAll: () => API.get('/tax-reports'),
  getOne: (id) => API.get(`/tax-reports/${id}`),
  create: (data) => API.post('/tax-reports', data),
  update: (id, data) => API.put(`/tax-reports/${id}`, data),
  delete: (id) => API.delete(`/tax-reports/${id}`),
  aiGenerate: (data) => API.post('/tax-reports/ai/generate', data),
};

export const miningStaking = {
  getAll: () => API.get('/mining-staking'),
  getOne: (id) => API.get(`/mining-staking/${id}`),
  create: (data) => API.post('/mining-staking', data),
  update: (id, data) => API.put(`/mining-staking/${id}`, data),
  delete: (id) => API.delete(`/mining-staking/${id}`),
  aiAnalyze: () => API.post('/mining-staking/ai/analyze'),
};

export const defi = {
  getAll: () => API.get('/defi'),
  getOne: (id) => API.get(`/defi/${id}`),
  create: (data) => API.post('/defi', data),
  update: (id, data) => API.put(`/defi/${id}`, data),
  delete: (id) => API.delete(`/defi/${id}`),
  aiAnalyze: () => API.post('/defi/ai/analyze'),
};

export const nft = {
  getAll: () => API.get('/nft'),
  getOne: (id) => API.get(`/nft/${id}`),
  create: (data) => API.post('/nft', data),
  update: (id, data) => API.put(`/nft/${id}`, data),
  delete: (id) => API.delete(`/nft/${id}`),
  aiAnalyze: () => API.post('/nft/ai/analyze'),
};

export const taxLossHarvest = {
  getAll: () => API.get('/tax-loss-harvest'),
  getOne: (id) => API.get(`/tax-loss-harvest/${id}`),
  create: (data) => API.post('/tax-loss-harvest', data),
  update: (id, data) => API.put(`/tax-loss-harvest/${id}`, data),
  delete: (id) => API.delete(`/tax-loss-harvest/${id}`),
  aiOpportunities: () => API.post('/tax-loss-harvest/ai/opportunities'),
};

export const audit = {
  getAll: () => API.get('/audit'),
  getOne: (id) => API.get(`/audit/${id}`),
  create: (data) => API.post('/audit', data),
  update: (id, data) => API.put(`/audit/${id}`, data),
  delete: (id) => API.delete(`/audit/${id}`),
  aiRiskAssessment: () => API.post('/audit/ai/risk-assessment'),
};

export const crossBorder = {
  getAll: () => API.get('/cross-border'),
  getOne: (id) => API.get(`/cross-border/${id}`),
  create: (data) => API.post('/cross-border', data),
  update: (id, data) => API.put(`/cross-border/${id}`, data),
  delete: (id) => API.delete(`/cross-border/${id}`),
  aiAnalyze: () => API.post('/cross-border/ai/analyze'),
};

export const compliance = {
  getAll: () => API.get('/compliance'),
  getOne: (id) => API.get(`/compliance/${id}`),
  create: (data) => API.post('/compliance', data),
  update: (id, data) => API.put(`/compliance/${id}`, data),
  delete: (id) => API.delete(`/compliance/${id}`),
  aiCheck: () => API.post('/compliance/ai/check'),
};

export const aiCenter = {
  chat: (data) => API.post('/ai/chat', data),
  taxPlanning: () => API.post('/ai/tax-planning'),
  costBasisOptimize: () => API.post('/ai/cost-basis-optimize'),
  washSaleCheck: () => API.post('/ai/wash-sale-check'),
  portfolioTaxRisk: () => API.post('/ai/portfolio-tax-risk'),
  regulatoryUpdates: () => API.post('/ai/regulatory-updates'),
  fullSummary: () => API.post('/ai/full-summary'),
  chatHistory: () => API.get('/ai/chat-history'),
};

export default API;
