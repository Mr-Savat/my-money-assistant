import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendNotificationEmail } from '../services/emailService';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { useNavigate } from 'react-router-dom';


const AuthView = ({ mode }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const savedUserString = localStorage.getItem('user_data');
    const savedUser = savedUserString ? JSON.parse(savedUserString) : null;

    if (mode === 'register') {
      localStorage.setItem('user_notifications', JSON.stringify({ email: true, push: true }));
      const newUser = { email, password, name };
      localStorage.setItem('user_data', JSON.stringify(newUser));

      try {
        await sendNotificationEmail(
          "Welcome to MoneyAI!",
          `Hi ${name}, thank you for joining MoneyAI!`
        );
      } catch (error) {
        console.error("Welcome email failed:", error);
      }

      alert("Account created! Please login.");
      navigate('/login');
    } else {
      if (savedUser && savedUser.email === email && savedUser.password === password) {
        try {
          await sendNotificationEmail(
            "New Login Detected",
            `Hello ${savedUser.name}, a new login to your MoneyAI account was detected on ${new Date().toLocaleString()}.`
          );
        } catch (error) {
          console.error("Login notification failed:", error);
        }

        localStorage.setItem('isAuthenticated', 'true');
        navigate('/');
      } else {
        alert("Invalid email or password!");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-900 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-indigo-900 mb-6">
          {mode === 'login' ? 'Welcome' : 'Create Account'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Full Name"
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            type="email" placeholder="Email" required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password" placeholder="Password" required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setPassword(e.target.value)}
          />

          {/*  Forgot Password Link  */}
          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button className="w-full bg-indigo-600 cursor-pointer text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <Link to={mode === 'login' ? "/register" : "/login"} className="text-indigo-600 font-bold">
            {mode === 'login' ? 'Register' : 'Login'}
          </Link>
        </p>
      </div>

      {/*  Forgot Password Modal  */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default AuthView;