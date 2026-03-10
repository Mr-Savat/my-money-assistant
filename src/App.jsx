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

const App = () => {
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
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