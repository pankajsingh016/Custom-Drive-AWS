// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './context/AuthContext'; // <-- Import useAuth

// A component to wrap protected routes
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth(); // Access user and loading state

  if (loading) {
    return <div>Loading authentication...</div>; // Or a spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />; // If not authenticated, redirect
  }

  return children; // If authenticated and not loading, render children
}

// Helper component for the root redirect to leverage AuthContext
function AuthRouteRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  return user ? <Navigate to="/files" replace /> : <Navigate to="/login" replace />;
}


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/files"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/files/:folderId"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirect '/' */}
          <Route
            path="/"
            element={
              <AuthRouteRedirect />
            }
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;