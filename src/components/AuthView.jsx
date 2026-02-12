import React, { useState } from 'react';

const AuthView = ({ mode }) => {
  const [email, setEmail] = useState('');
  // 1. Add state for the name
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const savedUserString = localStorage.getItem('user_data');
    const savedUser = savedUserString ? JSON.parse(savedUserString) : null;

    if (mode === 'register') {
      // Save new user
      localStorage.setItem('user_data', JSON.stringify({ email, password, name }));
      alert("Account created! Please login.");
      window.location.href = "/login";
    } else {
      // LOGIN LOGIC: Check if credentials match
      if (savedUser && savedUser.email === email && savedUser.password === password) {
        localStorage.setItem('isAuthenticated', 'true');
        window.location.href = "/";
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

          {/* 3. Conditionally show Name input only for Register mode */}
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
          <button className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <a href={mode === 'login' ? "/register" : "/login"} className="text-indigo-600 font-bold">
            {mode === 'login' ? 'Register' : 'Login'}
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthView;