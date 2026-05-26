import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Styling
import './App.css';

// Components & Layout
import Sidebar from './components/Sidebar';

// Page Views
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Products from './pages/Products';
import Services from './pages/Services';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import PortfolioVideos from './pages/PortfolioVideos';

// Route Guard to verify admin session
const AdminRouteGuard = ({ children }) => {
  const token = localStorage.getItem('lumina_admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-app-layout">
      <Sidebar />
      <main className="admin-main-viewport">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Unauthenticated Route */}
        <Route path="/login" element={<Login />} />

        {/* Authenticated Admin Dashboard Routes */}
        <Route 
          path="/" 
          element={
            <AdminRouteGuard>
              <Dashboard />
            </AdminRouteGuard>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <AdminRouteGuard>
              <Orders />
            </AdminRouteGuard>
          } 
        />
        <Route 
          path="/orders/:id" 
          element={
            <AdminRouteGuard>
              <OrderDetail />
            </AdminRouteGuard>
          } 
        />
        <Route 
          path="/products" 
          element={
            <AdminRouteGuard>
              <Products />
            </AdminRouteGuard>
          } 
        />
        <Route 
          path="/services" 
          element={
            <AdminRouteGuard>
              <Services />
            </AdminRouteGuard>
          } 
        />
        <Route 
          path="/users" 
          element={
            <AdminRouteGuard>
              <Users />
            </AdminRouteGuard>
          } 
        />
        <Route 
          path="/users/:id" 
          element={
            <AdminRouteGuard>
              <UserDetail />
            </AdminRouteGuard>
          } 
        />
        <Route 
          path="/portfolio" 
          element={
            <AdminRouteGuard>
              <PortfolioVideos />
            </AdminRouteGuard>
          } 
        />

        {/* Fallback Catch-All Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
