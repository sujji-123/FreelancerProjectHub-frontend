import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/auth',
});

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await apiClient.post('/login', formData);
      
      // ✅ Store JWT + user details in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // 🔑 Store userId separately for easy filtering later
      localStorage.setItem('userId', data.user._id);

      toast.success('Login successful! Welcome back.');

      if (data.user.role === 'client') {
        navigate('/client/dashboard');
      } else if (data.user.role === 'freelancer') {
        navigate('/freelancer/dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      toast.error(error.response?.data?.msg || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6'>
        
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-800'>Welcome Back!</h1>
          <p className='text-gray-500 mt-2'>Log in to access your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor="email" className='block text-sm font-medium text-gray-700'>Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
            />
          </div>

          <div className='relative'>
            <label htmlFor="password" className='block text-sm font-medium text-gray-700'>Password</label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className='w-full mt-1 px-4 py-2 border border-gray-300 pr-10 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 mt-1 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
            </button>
          </div>

          <div className='text-right text-sm'>
            <Link to="/forgot-password" className='font-medium text-indigo-600 hover:underline'>
              Forgot Password?
            </Link>
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors duration-300'
          >
            {isLoading ? 'Logging In...' : 'Login'}
          </button>
        </form>

        <div className='text-center'>
          <p className='text-sm text-gray-600'>Don't have an account?{' '}
            <Link to="/signup" className='font-semibold text-indigo-600 hover:underline'>Sign Up Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
