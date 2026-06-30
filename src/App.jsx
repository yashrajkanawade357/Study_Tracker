import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { CalendarProvider } from './context/CalendarContext';
import { TaskProvider } from './context/TaskContext';
import Toast from './components/Toast';
import Onboarding from './components/Onboarding';

// Entry points stay eager so first paint is instant. Everything else is
// code-split with React.lazy — each page (and its heavy deps like charts,
// PDF parsing, etc.) loads on demand. No feature changes, just deferred.
import Auth from './pages/Auth';
import Landing from './pages/Landing';

// Wrap React.lazy so a failed chunk load auto-recovers. After a new
// deploy the old hashed chunk filenames vanish; a still-open tab trying to
// load one would otherwise show a broken page. We reload once (guarded by a
// sessionStorage flag so it can never loop) to pull the fresh files.
const lazyWithReload = (importer) =>
  lazy(() =>
    importer()
      .then((m) => { sessionStorage.removeItem('vyora-chunk-reloaded'); return m; })
      .catch((err) => {
        if (!sessionStorage.getItem('vyora-chunk-reloaded')) {
          sessionStorage.setItem('vyora-chunk-reloaded', '1');
          window.location.reload();
          return new Promise(() => {}); // halt rendering until the reload happens
        }
        throw err; // already retried once — surface the real error
      })
  );

const Dashboard = lazyWithReload(() => import('./pages/Dashboard'));
const Analytics = lazyWithReload(() => import('./pages/Analytics'));
const AISuggestions = lazyWithReload(() => import('./pages/AISuggestions'));
const TimetableAnalyzer = lazyWithReload(() => import('./pages/TimetableAnalyzer'));
const Achievements = lazyWithReload(() => import('./pages/Achievements'));
const Pomodoro = lazyWithReload(() => import('./pages/Pomodoro'));
const Settings = lazyWithReload(() => import('./pages/Settings'));
const UserManual = lazyWithReload(() => import('./pages/UserManual'));
const Calendar = lazyWithReload(() => import('./pages/Calendar'));
const Tasks = lazyWithReload(() => import('./pages/Tasks'));
const Summariser = lazyWithReload(() => import('./pages/Summariser'));
const AdminGate = lazyWithReload(() => import('./components/AdminGate'));

// Shown briefly while a route's chunk loads.
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-navy-950">
    <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
  </div>
);

// Reset scroll to the top whenever the route changes, so a new page never
// opens scrolled down to wherever you clicked on the previous page.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
    document.querySelector('main')?.scrollTo?.(0, 0);
  }, [pathname]);
  return null;
};

const ProtectedRoute = ({ children, requireManual = true }) => {
  const { isAuthenticated, authInitialized, userProfile } = useApp();
  const location = useLocation();

  // Wait for auth to resolve before deciding, so a hard refresh / direct link
  // to a protected route (e.g. /calendar) doesn't bounce to the wrong place.
  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  
  if (requireManual && userProfile && !userProfile.hasSeenManual && location.pathname !== '/manual') {
    return <Navigate to="/manual" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, authInitialized, isPasswordRecovery } = useApp();

  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path="/auth"
          element={isAuthenticated && !isPasswordRecovery ? <Navigate to="/dashboard" replace /> : <Auth />}
        />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute><AISuggestions /></ProtectedRoute>} />
        <Route path="/timetable" element={<ProtectedRoute><TimetableAnalyzer /></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
        <Route path="/pomodoro" element={<ProtectedRoute><Pomodoro /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/manual" element={<ProtectedRoute requireManual={false}><UserManual /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute requireManual={false}><Calendar /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute requireManual={false}><Tasks /></ProtectedRoute>} />
        <Route path="/summariser" element={<ProtectedRoute requireManual={false}><Summariser /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requireManual={false}><AdminGate /></ProtectedRoute>} />
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppProvider>
        <CalendarProvider>
          <TaskProvider>
            <AppRoutes />
            <Onboarding />
            <Toast />
          </TaskProvider>
        </CalendarProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
