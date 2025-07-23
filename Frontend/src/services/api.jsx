// File: src/services/api.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

export const loginUser = (data) => axios.post(`${API_BASE}/auth/login`, data,{withCredentials:true});
export const registerUser = (data) => axios.post(`${API_BASE}/auth/register`, data);
export const fetchFiles = () => axios.get(`${API_BASE}/files`, { withCredentials: true });

