// File: src/services/api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

// Auth
export const loginUser = (data) =>
  axios.post(`${API_BASE}/auth/login`, data, { withCredentials: true });

export const registerUser = (data) =>
  axios.post(`${API_BASE}/auth/register`, data);

// File & Folder Fetch
export const fetchFiles = (folderId = null) =>
  axios.get(`${API_BASE}/files${folderId ? `?folderId=${folderId}` : ""}`, {
    withCredentials: true,
  });

// File Upload
export const uploadFile = (formData) =>
  axios.post(`${API_BASE}/files/file`, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

// Folder Upload
export const uploadFolder = (formData) =>
  axios.post(`${API_BASE}/files/folder`, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

// Delete File or Folder
export const deleteItem = (type, id) =>
  axios.delete(`${API_BASE}/files/${type}/${id}`, {
    withCredentials: true,
  });

// Get Presigned URL
export const getPresignedUrl = (fileId) =>
  axios.get(`${API_BASE}/files/presigned/${fileId}`, {
    withCredentials: true,
  });

