import axios from 'axios';

const baseURL = import.meta.env.PROD 
  ? 'https://trippilot-ai-app.onrender.com/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
