import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { SiteBanner } from './components/SiteBanner';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FlightSearchPage } from './pages/FlightSearchPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { LiveTrackingPage } from './pages/LiveTrackingPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
          <SiteBanner />
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Authenticated Passenger Routes */}
              <Route
                path="/flights"
                element={
                  <ProtectedRoute>
                    <FlightSearchPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-trips"
                element={
                  <ProtectedRoute>
                    <MyTripsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/live-radar"
                element={
                  <ProtectedRoute>
                    <LiveTrackingPage />
                  </ProtectedRoute>
                }
              />

              {/* Administrator Protected Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
