import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const getAvailableDatasets = async () => {
  const response = await api.get('/datasets/available');
  return response.data;
};

export const loadDataset = async (filename) => {
  const response = await api.post('/datasets/load', { filename });
  return response.data;
};

export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const cleanDataset = async () => {
  const response = await api.post('/clean');
  return response.data;
};

export const getSummary = async () => {
  const response = await api.get('/summary');
  return response.data;
};

export const getTrends = async (params = {}) => {
  const response = await api.get('/trends', { params });
  return response.data;
};

export const trainModels = async () => {
  const response = await api.post('/train');
  return response.data;
};

export const getModelStatus = async () => {
  const response = await api.get('/model/status');
  return response.data;
};

export const predictPM25 = async (features) => {
  const response = await api.post('/predict', features);
  return response.data;
};

export const detectAnomalies = async (params = {}) => {
  const response = await api.post('/anomalies', params);
  return response.data;
};

export const getRiskAssessment = async () => {
  const response = await api.get('/risk');
  return response.data;
};

export const getRecommendations = async () => {
  const response = await api.get('/recommendations');
  return response.data;
};

export const generateReport = async () => {
  const response = await api.post('/report');
  return response.data;
};

export const getReportDownloadUrl = (filename) => {
  return `${API_BASE_URL}/download/report/${filename}`;
};

export const getCSVDownloadUrl = (type) => {
  return `${API_BASE_URL}/download/csv/${type}`;
};

export default api;
