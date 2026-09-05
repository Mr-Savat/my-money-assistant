import Dashboard from './pages/dashboard/Dashboard';
import BlockchainView from './components/BlockchainView';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import AuthView from './components/AuthView';
import SettingsView from './pages/Settings/SettingsView';

import { LanguageProvider } from './context/LanguageContext';
import AIChat from './pages/aichart/AIChat';
import Forecast from './pages/forecast/Forecast';

import { auth } from './firebase/config';

const App = () => {
  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
    // Clear user session and cached data (keep theme and language preferences)
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_image');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('user_transactions_list');
    localStorage.removeItem('dashboard_stats');
    localStorage.removeItem('dashboard_chart');
    localStorage.removeItem('forecastStorage');
    window.location.href = "/login";
  };

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthView mode="login" />} />
          <Route path="/register" element={<AuthView mode="register" />} />

          {/* Protected Dashboard Routes */}
          <Route path="/" element={<ProtectedRoute><DashboardLayout onLogout={handleLogout} /></ProtectedRoute>}>
            {/* URL: / */}
            <Route index element={<Dashboard/>} />

            {/* URL: /chat */}
            <Route path="chat" element={<AIChat />} />

            {/* URL: /forecast */}
            <Route path="forecast" element={<Forecast />} />

            {/* URL: /blockchain */}
            <Route path="blockchain" element={<BlockchainView />} />

            {/* URL: /settings */}
            <Route path="settings" element={<SettingsView />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
    
  );
};

export default App;