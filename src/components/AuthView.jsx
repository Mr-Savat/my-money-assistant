import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendNotificationEmail } from '../services/emailService';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation'; // ++++++ បន្ថែម Translation ++++++

const AuthView = ({ mode }) => {
  const { t } = useTranslation(); // ++++++ ប្រើ Translation ++++++
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const savedUserString = localStorage.getItem('user_data');
    const savedUser = savedUserString ? JSON.parse(savedUserString) : null;

    try {
      if (mode === 'register') {
        localStorage.setItem('user_notifications', JSON.stringify({ email: true, push: true }));
        const newUser = { email, password, name };
        localStorage.setItem('user_data', JSON.stringify(newUser));

        await sendNotificationEmail(
          "Welcome to MoneyAI!",
          `Hi ${name}, thank you for joining MoneyAI!`
        );

        alert("Account created! Please login.");
        navigate('/login');
      } else {
        if (savedUser && savedUser.email === email && savedUser.password === password) {
          await sendNotificationEmail(
            "New Login Detected",
            `Hello ${savedUser.name}, a new login to your MoneyAI account was detected on ${new Date().toLocaleString()}.`
          );

          localStorage.setItem('isAuthenticated', 'true');
          navigate('/');
        } else {
          alert(t('auth.invalid_credentials')); // ++++++ ប្រើ Translation ++++++
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-900 dark:bg-gray-900 px-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-center text-indigo-900 dark:text-indigo-400 mb-6">
          {mode === 'login' ? t('auth.welcome') : t('auth.create_account')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              type="text"
              placeholder={t('auth.fullname')}
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-colors"
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          )}

          <input
            type="email"
            placeholder={t('auth.email')}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-colors"
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          
          <input
            type="password"
            placeholder={t('auth.password')}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-colors"
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          {/* Forgot Password Link */}
          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm cursor-pointer text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                disabled={loading}
              >
                {t('auth.forgot_password')}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-600 cursor-pointer text-white p-3 rounded-lg font-semibold 
              hover:bg-indigo-700 transition flex items-center justify-center gap-2
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>{mode === 'login' ? t('auth.logging_in') : t('auth.creating_account')}</span>
              </>
            ) : (
              mode === 'login' ? t('auth.login') : t('auth.signup')
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {mode === 'login' ? t('auth.no_account') : t('auth.have_account')}
          <Link to={mode === 'login' ? "/register" : "/login"} className="text-indigo-600 dark:text-indigo-400 font-bold ml-1 hover:underline">
            {mode === 'login' ? t('auth.register') : t('auth.login')}
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default AuthView;