import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5001/api/auth',
});

const Verify = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    navigate('/signup');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {

      const { data } = await apiClient.post('/verify', { email, otp });

      localStorage.setItem('token', data.token);

      toast.success('Verification successful! You are now logged in.');

      if (data.user?.role === 'client') {
        navigate('/client/dashboard');
      } else if (data.user?.role === 'freelancer') {
        navigate('/freelancer/dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      toast.error(
        error.response?.data?.msg ||
          'Verification failed. Invalid OTP or OTP has expired.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-800'>Check Your Email</h1>
          <p className='text-gray-500 mt-2'>
            We've sent a 6-digit OTP to{' '}
            <strong className='text-indigo-600'>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label
              htmlFor='otp'
              className='block text-sm font-medium text-gray-700'
            >
              Verification Code
            </label>
            <input
              id='otp'
              name='otp'
              type='text'
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder='Enter your 6-digit code'
              required
              maxLength='6'
              className='w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
            />
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors duration-300'
          >
            {isLoading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>

        <div className='text-center'>
          <p className='text-sm text-gray-600'>
            Didn't receive a code?{' '}
            <Link
              to='/signup'
              className='font-semibold text-indigo-600 hover:underline'
            >
              Start Over
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verify;
