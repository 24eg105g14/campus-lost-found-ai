import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ReportFoundPage from './pages/ReportFoundPage';
import SearchPage from './pages/SearchPage';
import CreateMissingPage from './pages/CreateMissingPage';
import ItemDetailPage from './pages/ItemDetailPage';
import ChatPage from './pages/ChatPage';
import MyPostsPage from './pages/MyPostsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import ElectricBackground from './components/ElectricBackground';

const getElectricVariant = (pathname) => {
  if (pathname === '/') return 'hero';
  if (pathname === '/login' || pathname === '/register') return 'auth';
  if (pathname === '/dashboard') return 'dashboard';
  if (pathname === '/messages') return 'chat';
  if (pathname.startsWith('/items/')) return 'verification';
  if (pathname === '/report-found' || pathname === '/create-missing') return 'form';
  return 'content';
};

const ElectricAppShell = ({ children }) => {
  const { pathname } = useLocation();
  return (
    <div className={`app-electric-shell electric-page-${getElectricVariant(pathname)}`}>
      <ElectricBackground variant={getElectricVariant(pathname)} fixed />
      <div className="app-electric-content">{children}</div>
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <ElectricAppShell><Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
            <Route path="/report-found" element={<ProtectedRoute><ReportFoundPage /></ProtectedRoute>} />
            <Route path="/create-missing" element={<ProtectedRoute><CreateMissingPage /></ProtectedRoute>} />
            <Route path="/items/:id" element={<ProtectedRoute><ItemDetailPage /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/my-posts" element={<ProtectedRoute><MyPostsPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes></ElectricAppShell>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
