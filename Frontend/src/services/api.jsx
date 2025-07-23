// File: src/services/api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

export const loginUser = (data) =>
  axios.post(`${API_BASE}/auth/login`, data, { withCredentials: true });

export const registerUser = (data) =>
  axios.post(`${API_BASE}/auth/register`, data);

export const fetchFiles = () =>
  axios.get(`${API_BASE}/files`, { withCredentials: true });

export const uploadFile = (formData) =>
  axios.post(`${API_BASE}/files/upload`, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

export const uploadFolder = (formData) => axios.post(`${API_BASE}/files/uploadFolder`, formData,{
    withCredentials:true,
    headers:{"Content-Type":"multipart/form-data"},
});