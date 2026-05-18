import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const predictColleges = async (data) => {
  const response = await api.post('/predict', data);
  return response.data;
};

export const getColleges = async (params) => {
  const response = await api.get('/colleges', { params });
  return response.data;
};

export const getCollegeDetail = async (code, params) => {
  const response = await api.get(`/colleges/${code}`, { params });
  return response.data;
};

export const getBranches = async (params) => {
  const response = await api.get('/branches', { params });
  return response.data;
};

export const getDistricts = async () => {
  const response = await api.get('/districts');
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const incrementVisitor = async () => {
  const response = await api.post('/stats/increment');
  return response.data;
};

export default api;
