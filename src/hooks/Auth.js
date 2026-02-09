import React, { useState } from 'react';

const Auth = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = (e) => {
    e.preventDefault();
    
    if (isRegistering) {
      // REGISTER LOGIC
      localStorage.setItem('user_data', JSON.stringify({
        ...formData,
        plan: 'PRO PLAN' // Default plan as seen in your screenshot
      }));
      alert('Account created! Switching to login...');
      setIsRegistering(false);
    } else {
      // LOGIN LOGIC
      const storedUser = JSON.parse(localStorage.getItem('user_data'));
      
      if (storedUser && storedUser.email === formData.email && storedUser.password === formData.password) {
        alert(`Welcome back, ${storedUser.name}!`);
        // Redirect logic here (e.g., useNavigate from react-router-dom)
      } else {
        alert('Invalid credentials or user does not exist.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">
          {isRegistering ? 'Create Account' : 'Welcome to MoneyAI'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-slate-600">Full Name</label>
              <input 
                name="name" type="text" required 
                className="w-full mt-1 p-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                onChange={handleChange}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-600">Email Address</label>
            <input 
              name="email" type="email" required 
              className="w-full mt-1 p-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600">Password</label>
            <input 
              name="password" type="password" required 
              className="w-full mt-1 p-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
            {isRegistering ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="ml-2 text-indigo-600 font-bold hover:underline"
          >
            {isRegistering ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;