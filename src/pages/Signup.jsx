import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const apiClient = axios.create({
  baseURL: '/api/auth', 
});

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'freelancer', 
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
      await apiClient.post('/signup', formData);
      toast.success('An OTP has been sent to your email for verification.');
      
      navigate('/verify', { state: { email: formData.email } }); 
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to sign up. This email might already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6'>
        
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-800'>Create an Account</h1>
          <p className='text-gray-500 mt-2'>Join our community of freelancers and clients.</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor="name" className='block text-sm font-medium text-gray-700'>Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
            />
          </div>
          
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
              placeholder="Create a strong password"
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
          
          <div>
            <span className="block text-sm font-medium text-gray-700">I am a:</span>
            <div className="mt-2 flex items-center space-x-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="freelancer"
                  checked={formData.role === 'freelancer'}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700">Freelancer</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={formData.role === 'client'}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700">Client</span>
              </label>
            </div>
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors duration-300'
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>


        <div className='text-center'>
          <p className='text-sm text-gray-600'>Already have an account? {' '}
            <Link to="/login" className='font-semibold text-indigo-600 hover:underline'>Login Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
