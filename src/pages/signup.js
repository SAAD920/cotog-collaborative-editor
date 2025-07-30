// src/pages/signup.js - REPLACE your existing file with this complete version
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

const SignupPage = () => {
  const router = useRouter();
  const { signup, isAuthenticated, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [formState, setFormState] = useState({
    isLoading: false,
    error: '',
    showPassword: false,
    termsAccepted: false
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let score = 0;
    const feedback = [];

    if (password.length < 6) {
      feedback.push('At least 6 characters');
    } else {
      score++;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Include lowercase letters');
    } else {
      score++;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Include uppercase letters');
    } else {
      score++;
    }

    if (!/\d/.test(password)) {
      feedback.push('Include numbers');
    } else {
      score++;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Include special characters');
    } else {
      score++;
    }

    return { score, feedback };
  };

  // Input validation rules
  const validateForm = () => {
    const errors = {};
    const { firstName, lastName, username, email, password, confirmPassword } = formData;

    // First name validation
    if (!firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    // Username validation
    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

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

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Terms acceptance
    if (!formState.termsAccepted) {
      errors.terms = 'You must accept the terms and conditions';
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
      
      // Real-time password strength checking
      if (name === 'password') {
        setPasswordStrength(checkPasswordStrength(value));
      }
      
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

  // Signup submission handler
  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setFormState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      const result = await signup({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      if (result.success) {
        // Redirect to home or dashboard
        router.push('/');
      } else {
        setFormState(prev => ({ 
          ...prev, 
          error: result.error || 'Signup failed'
        }));
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      setFormState(prev => ({ 
        ...prev, 
        error: error.message || 'An error occurred during signup'
      }));
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Password visibility toggle
  const togglePasswordVisibility = () => {
    setFormState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };

  // Get password strength color
  const getPasswordStrengthColor = (score) => {
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score) => {
    if (score <= 1) return 'Very Weak';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
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
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                sign in to your existing account
              </Link>
            </p>
          </div>

          {/* Benefits Section */}
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">🎉 Account Benefits:</h3>
            <ul className="text-xs text-green-700 space-y-1">
              <li>✅ Create and join collaboration rooms</li>
              <li>✅ Real-time code sharing with team members</li>
              <li>✅ Integrated chat and voice communication</li>
              <li>✅ Room management and user controls</li>
              <li>✅ Persistent room history and settings</li>
            </ul>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
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

            <div className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                      validationErrors.firstName 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 sm:text-sm`}
                    placeholder="First name"
                    disabled={formState.isLoading}
                  />
                  {validationErrors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                      validationErrors.lastName 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 sm:text-sm`}
                    placeholder="Last name"
                    disabled={formState.isLoading}
                  />
                  {validationErrors.lastName && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    validationErrors.username 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 sm:text-sm`}
                  placeholder="Choose a username"
                  disabled={formState.isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">Letters, numbers, and underscores only</p>
                {validationErrors.username && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    validationErrors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 sm:text-sm`}
                  placeholder="Enter your email"
                  disabled={formState.isLoading}
                />
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
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                      validationErrors.password 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 sm:text-sm`}
                    placeholder="Create a password"
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Password strength:</span>
                      <span className={`text-sm font-medium ${
                        passwordStrength.score <= 2 ? 'text-red-600' : 
                        passwordStrength.score <= 3 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {getPasswordStrengthText(passwordStrength.score)}
                      </span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <ul className="mt-1 text-xs text-gray-500 list-disc list-inside">
                        {passwordStrength.feedback.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={formState.showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    validationErrors.confirmPassword 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-1 sm:text-sm`}
                  placeholder="Confirm your password"
                  disabled={formState.isLoading}
                />
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="termsAccepted"
                  name="termsAccepted"
                  type="checkbox"
                  checked={formState.termsAccepted}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={formState.isLoading}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="termsAccepted" className="font-medium text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </a>
                </label>
                {validationErrors.terms && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.terms}</p>
                )}
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
                    Creating account...
                  </div>
                ) : (
                  <>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                      </svg>
                    </span>
                    Create Account
                  </>
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
