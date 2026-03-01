import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  
  const [isLogin, setIsLogin] = useState(false); 
  
 
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => { 
    e.preventDefault();
    setError('');

    
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    
    const url = isLogin ? 'http://127.0.0.1:5000/login' : 'http://127.0.0.1:5000/signup';

    
    const payload = isLogin 
      ? { email, password } 
      : { name: fullName, email, password };

    try {
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      
      if (data.status === 'success') {
        
        navigate('/dashboard', { 
          state: { 
            name: data.name ? data.name : fullName, 
            email: email 
          } 
        });
      } else {
        
        setError(data.message);
      }
    } catch (err) {
      setError("Backend server se connect nahi ho raha. Check karein ke Python chal raha hai?");
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4 font-sans">
      
      
        <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-lg font-semibold">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
           Academic Performance Predictor 
        </div>

        
        <h1 className="text-2xl font-bold text-slate-800 mb-2 mt-6">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h1>
      <p className="text-slate-500 mb-8 text-center text-sm md:text-base">
        {isLogin 
          ? 'Enter your details to access your account' 
          : 'Get started with performance predictions'}
      </p>

      
      <div className="w-full max-w-md p-8 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        
        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
         
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Full Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-700"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-700"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-700"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Confirm Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-700"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          
          <button
            type="submit"
            className="w-full py-3.5 mt-2 text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition duration-200 font-semibold shadow-md"
          >
            {isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        
        <p className="text-sm text-center text-slate-600 mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(''); 
            }}
            className="text-blue-600 hover:text-blue-700 hover:underline font-semibold"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;