// src/pages/login.js - 
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formState, setFormState] = useState({
    isLoading: false,
    error: '',
    showPassword: false,
    rememberMe: false
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const redirectTo = router.query.redirect || '/';
      router.push(redirectTo);
    }
  }, [isAuthenticated, authLoading, router]);

  // Input validation rules
  const validateForm = () => {
    const errors = {};
    const { email, password } = formData;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormState(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Clear validation error for this field
      if (validationErrors[name]) {
        setValidationErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
    
    // Clear general error
    if (formState.error) {
      setFormState(prev => ({ ...prev, error: '' }));
    }
  };

  // Login submission handler
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setFormState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      const result = await login(
        formData.email.trim().toLowerCase(),
        formData.password,
        formState.rememberMe
      );

      if (result.success) {
        // Redirect to intended page or dashboard
        const redirectTo = router.query.redirect || '/';
        router.push(redirectTo);
      } else {
        setFormState(prev => ({ 
          ...prev, 
          error: result.error || 'Login failed'
        }));
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setFormState(prev => ({ 
        ...prev, 
        error: error.message || 'An error occurred during login'
      }));
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Password visibility toggle
  const togglePasswordVisibility = () => {
    setFormState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };

  // Quick login function for demo accounts
  const quickLogin = async (email) => {
    setFormData({ email, password: 'password123' });
    setFormState(prev => ({ ...prev, error: '', isLoading: true }));

    try {
      const result = await login(email, 'password123', false);
      if (result.success) {
        router.push('/');
      } else {
        setFormState(prev => ({ ...prev, error: result.error || 'Login failed' }));
      }
    } catch (error) {
      setFormState(prev => ({ ...prev, error: 'Quick login failed' }));
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                create a new account
              </Link>
            </p>
          </div>

          {/* Demo Account Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-3">🎯 Demo Accounts (Click to login):</h3>
            <div className="space-y-2">
              <button
                onClick={() => quickLogin('john.doe@example.com')}
                disabled={formState.isLoading}
                className="w-full text-left text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-2 rounded transition-colors disabled:opacity-50"
              >
                <strong>👤 Regular User:</strong> john.doe@example.com
              </button>
              <button
                onClick={() => quickLogin('sarah.wilson@example.com')}
                disabled={formState.isLoading}
                className="w-full text-left text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-2 rounded transition-colors disabled:opacity-50"
              >
                <strong>👑 Admin:</strong> sarah.wilson@example.com
              </button>
              <button
                onClick={() => quickLogin('alex.kim@example.com')}
                disabled={formState.isLoading}
                className="w-full text-left text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-2 rounded transition-colors disabled:opacity-50"
              >
                <strong>🛡️ Moderator:</strong> alex.kim@example.com
              </button>
              <p className="text-xs text-blue-600 mt-2">
                <strong>Password for all accounts:</strong> password123
              </p>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {/* General Error Message */}
            {formState.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{formState.error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      validationErrors.email 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 sm:text-sm`}
                    placeholder="Enter your email"
                    disabled={formState.isLoading}
                  />
                  {validationErrors.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={formState.showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                      validationErrors.password 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 sm:text-sm`}
                    placeholder="Enter your password"
                    disabled={formState.isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                    disabled={formState.isLoading}
                  >
                    {formState.showPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m-3.122-3.122a3 3 0 013.122 3.122M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formState.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={formState.isLoading}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={formState.isLoading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  formState.isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                } transition-colors duration-200`}
              >
                {formState.isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Sign in
                  </>
                )}
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account yet?{' '}
                <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  Create one here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
