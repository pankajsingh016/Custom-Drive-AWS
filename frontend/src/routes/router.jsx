// File: src/router.jsx
import { createBrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';

export const router = createBrowserRouter([
  { path: '/files', element: <Dashboard /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
]);

