import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AuthPage from './components/auth/AuthPage';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import StoreManagement from './components/admin/StoreManagement';
import StoreList from './components/user/StoreList';
import MyRatings from './components/user/MyRatings';
import OwnerDashboard from './components/owner/OwnerDashboard';
import Profile from './components/common/Profile';
import Unauthorized from './components/common/Unauthorized';
import './App.css';

const AppRoutes = () => {
  const { isAuthenticated, hasRole } = useAuth();

  const getDefaultRoute = () => {
    if (!isAuthenticated()) return '/auth';
    if (hasRole('admin')) return '/admin/dashboard';
    if (hasRole('user')) return '/stores';
    if (hasRole('store_owner')) return '/owner/dashboard';
    return '/auth';
  };

  return (
    <Routes>
      <Route path="/auth" element={
        isAuthenticated() ? <Navigate to={getDefaultRoute()} replace /> : <AuthPage />
      } />
      
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/users" element={
        <ProtectedRoute requiredRole="admin">
          <UserManagement />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/stores" element={
        <ProtectedRoute requiredRole="admin">
          <StoreManagement />
        </ProtectedRoute>
      } />
      
      <Route path="/stores" element={
        <ProtectedRoute requiredRole="user">
          <StoreList />
        </ProtectedRoute>
      } />
      
      <Route path="/my-ratings" element={
        <ProtectedRoute requiredRole="user">
          <MyRatings />
        </ProtectedRoute>
      } />
      
      <Route path="/owner/dashboard" element={
        <ProtectedRoute requiredRole="store_owner">
          <OwnerDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute requiredRoles={['admin', 'user', 'store_owner']}>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <AppRoutes />
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
