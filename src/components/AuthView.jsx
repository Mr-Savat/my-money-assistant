import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import DotField from './DotField';
import { auth } from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthView = ({ mode }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: name });
        await sendEmailVerification(user);
        const idToken = await user.getIdToken(true);

        const response = await fetch(`${API_URL}/api/auth/verify-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken })
        });

        const data = await response.json();
        if (data.success) {
          localStorage.setItem('user_data', JSON.stringify(data.user));
          localStorage.setItem('isAuthenticated', 'true');
          alert(t('auth.verification_email_sent'));
          navigate('/');
        } else {
          setError(t('auth.registration_failed'));
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
          setError(t('auth.email_not_verified'));
          setLoading(false);
          return;
        }

        const idToken = await user.getIdToken();
console.log("TEST THIS TOKEN:", idToken); // Add this line
        const response = await fetch(`${API_URL}/api/auth/verify-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken })
        });

        const data = await response.json();
        if (data.success) {
          localStorage.setItem('user_data', JSON.stringify(data.user));
          localStorage.setItem('isAuthenticated', 'true');
          navigate('/');
        } else {
          setError(t('auth.login_failed'));
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      handleFirebaseError(error);
    } finally {
      setLoading(false);
    }
  };

  // មុខងារសម្រាប់ Handle Error របស់ Firebase
  const handleFirebaseError = (error) => {
    switch (error.code) {
      case 'auth/email-already-in-use': setError(t('auth.email_already_in_use')); break;
      case 'auth/invalid-email': setError(t('auth.invalid_email')); break;
      case 'auth/weak-password': setError(t('auth.weak_password')); break;
      case 'auth/user-not-found':
      case 'auth/wrong-password': setError(t('auth.invalid_credentials')); break;
      case 'auth/popup-closed-by-user': setError("ការ Login ត្រូវបានបោះបង់ (Popup ត្រូវបានបិទ)។"); break;
      case 'auth/cancelled-popup-request': setError("មានបញ្ហាជាន់គ្នា ពេលកំពុងបើកផ្ទាំង Login។"); break;
      case 'auth/unauthorized-domain': setError("Domain នេះមិនទាន់ត្រូវបាន Add ទៅក្នុង Firebase Authorized Domains ទេ។ សូមចូលទៅ Firebase Console ដើម្បី Add Domain។"); break;
      default: setError(t('auth.unknown_error'));
    }
  };

  // ការកែសម្រួល handleGoogleSignIn ថ្មី
  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      
      // បន្ថែមនេះដើម្បីឱ្យ Google បង្ហាញផ្ទាំងជ្រើសរើស Account និងការពារការបិទ Popup ដោយគ្មានមូលហេតុ
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const response = await fetch(`${API_URL}/api/auth/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user_data', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/');
      } else {
        setError(t('auth.login_failed'));
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      handleFirebaseError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 px-4 py-8">
      {/* Background Animated Dot Field */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <DotField
          dotRadius={1.5}
          dotSpacing={16}
          cursorRadius={400}
          cursorForce={0.12}
          bulgeStrength={60}
          sparkle={true}
          waveAmplitude={2}
          gradientFrom="rgba(99, 102, 241, 0.45)"
          gradientTo="rgba(168, 85, 247, 0.3)"
          glowColor="rgba(99, 102, 241, 0.2)"
          glowRadius={200}
        />
      </div>

      {/* Subtle ambient glows for visual depth */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Auth Card */}
      <div className="relative z-10 max-w-md w-full bg-white/95 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/60 p-8 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-center text-indigo-900 dark:text-indigo-400 mb-6">
          {mode === 'login' ? t('auth.welcome') : t('auth.create_account')}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              type="text"
              placeholder={t('auth.fullname')}
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              value={name}
            />
          )}

          <input
            type="email"
            placeholder={t('auth.email')}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            value={email}
          />

          <input
            type="password"
            placeholder={t('auth.password')}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            value={password}
          />

          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm cursor-pointer text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium"
                disabled={loading}
              >
                {t('auth.forgot_password')}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-600 cursor-pointer text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              {t('auth.or_continue_with')}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full cursor-pointer flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white p-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition disabled:opacity-50"
        >
          {/* SVG Google Icons... */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>{t('auth.sign_in_with_google')}</span>
        </button>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default AuthView;