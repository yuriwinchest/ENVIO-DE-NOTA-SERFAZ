import axios from 'axios';

const baseURL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV)
      ? 'http://localhost:3000/api'
      : '/api';

const api = axios.create({ baseURL });

export default api;
