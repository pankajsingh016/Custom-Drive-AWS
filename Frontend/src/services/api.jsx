// File: src/services/api.js
import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE;

// Auth
export const loginUser = (data) =>
  axios.post(`${API_BASE}/auth/login`, data, { withCredentials: true });

export const logoutUser = (data) =>
  axios.post(`${API_BASE}/auth/logout`, data, { withCredentials: true });

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

// Delete File or Folder
export const deleteItem = (itemType, itemId) =>
  axios.delete(`${API_BASE}/files/${itemType}/${itemId}`, {
    withCredentials: true,
  });

// Get Presigned URL
export const getDownloadUrl = (fileId) =>
  axios.get(`${API_BASE}/files/download/${fileId}`, {
    withCredentials: true,
  });

export const getViewFile = (fileId) =>
  axios.get(`${API_BASE}/files/view/${fileId}`, {
    withCredentials: true,
  });

// Folder Upload
export const uploadFolder = (formData) =>
  axios.post(`${API_BASE}/files/folder`, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

export const createFolder = (name, parentId = null) =>
  axios.post(
    `${API_BASE}/folders/create`,
    { name, parentId },
    { withCredentials: true }
  );

export const uploadFolderContents = (formData) =>
  axios.post(`${API_BASE}/files/folder`, formData, {
    // Matches the new backend route
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" }, // Important for FormData
    onUploadProgress: (progressEvent) => {
      // Optional: for progress bar
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`Folder upload progress: ${percentCompleted}%`);
      // You can return this progress or use a callback if needed in the UI
    },
  });
