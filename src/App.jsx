import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Toast from './components/Toast';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import AISuggestions from './pages/AISuggestions';
import TimetableAnalyzer from './pages/TimetableAnalyzer';
import Achievements from './pages/Achievements';
import Pomodoro from './pages/Pomodoro';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import UserManual from './pages/UserManual';
import Onboarding from './components/Onboarding';

const ProtectedRoute = ({ children, requireManual = true }) => {
  const { isAuthenticated, userProfile } = useApp();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  
  if (requireManual && userProfile && !userProfile.hasSeenManual && location.pathname !== '/manual') {
    return <Navigate to="/manual" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated } = useApp();

  return (
    <Routes>
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />}
      />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/ai" element={<ProtectedRoute><AISuggestions /></ProtectedRoute>} />
      <Route path="/timetable" element={<ProtectedRoute><TimetableAnalyzer /></ProtectedRoute>} />
      <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
      <Route path="/pomodoro" element={<ProtectedRoute><Pomodoro /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/manual" element={<ProtectedRoute requireManual={false}><UserManual /></ProtectedRoute>} />
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
        <Onboarding />
        <Toast />
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
