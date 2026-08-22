import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SocketProvider } from './context/SocketContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkerPendingApproval from './pages/WorkerPendingApproval';
import CustomerDashboard from './pages/CustomerDashboard';
import MyBookings from './pages/MyBookings';
import WorkerDashboard from './pages/WorkerDashboard';
import SocietyAdminDashboard from './pages/SocietyAdminDashboard';
import FederationAdminDashboard from './pages/FederationAdminDashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/worker-pending" element={<WorkerPendingApproval />} />

          {/* Clean URL for Service Discovery */}
          <Route
            path="/explore-services"
            element={
              <ProtectedRoute allowedRoles={['customer', 'worker', 'societyAdmin', 'federationAdmin']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/customer-dashboard" element={<Navigate to="/explore-services" replace />} />

          {/* Clean URL for Customer Activity & Bookings */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={['customer', 'federationAdmin']}>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/worker-dashboard"
            element={
              <ProtectedRoute allowedRoles={['worker', 'federationAdmin']}>
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/society-dashboard"
            element={
              <ProtectedRoute allowedRoles={['societyAdmin', 'federationAdmin']}>
                <SocietyAdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/federation-dashboard"
            element={
              <ProtectedRoute allowedRoles={['federationAdmin']}>
                <FederationAdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <AppRoutes />
          </Router>
        </SocketProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
