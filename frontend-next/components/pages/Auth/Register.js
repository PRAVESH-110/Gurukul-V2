'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, User, UserCheck } from 'lucide-react';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import WarmupLoader from '@/components/UI/WarmupLoader';
import logo from '@/assets/logo.png';

const Register = () => {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Track if this is the first server request this session (cold start handling)
  const [isFirstAttempt, setIsFirstAttempt] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('server_warm')) {
      setIsFirstAttempt(false);
    }
  }, []);

  const [selectedRole, setSelectedRole] = useState('student');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
  } = useForm({
    defaultValues: {
      role: 'student',
    },
  });

  const from = searchParams.get('from') || searchParams.get('redirect') || '/dashboard';

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await registerUser(data);
      if (result.success) {
        // Mark server as warm on success
        sessionStorage.setItem('server_warm', 'true');
        setIsFirstAttempt(false);
        router.push(from);
      } else {
        setIsFirstAttempt(false); // Validation error — not a cold start
        setError('root', { message: result.message });
      }
    } catch (error) {
      if (isFirstAttempt && error?.silent) {
        // Silent cold-start failure — just reset so user can retry
        console.warn('Register cold-start failure, suppressed.');
        setIsFirstAttempt(false);
      } else {
        setError('root', { message: 'An unexpected error occurred' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Dark Blue Border Card Wrapper */}
      <div className="auth-card-wrapper max-w-md w-full animate-slide-up">
        <div className="auth-border-beam" />
        <div className="relative w-full space-y-8 bg-white p-8 rounded-[14px]">
          <div>
            <div className="flex justify-center">
              <Link
                href="/"
                className="inline-block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-full"
              >
                <Image
                  src={logo}
                  alt="Gurukul Logo"
                  width={64}
                  height={64}
                  priority
                  className="w-16 h-16 object-contain transform group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                />
              </Link>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Join Gurukul
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Start your learning journey today
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I want to join as a:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="relative group cursor-pointer">
                    <input
                      {...register('role', { required: 'Please select a role' })}
                      type="radio"
                      value="student"
                      checked={selectedRole === 'student'}
                      onChange={() => {
                        setSelectedRole('student');
                        setValue('role', 'student');
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                        selectedRole === 'student'
                          ? 'border-primary-600 bg-primary-50/50 ring-1 ring-primary-600 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div
                          className={`p-2 rounded-lg ${selectedRole === 'student' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500 group-hover:text-gray-700'}`}
                        >
                          <User className="h-6 w-6" />
                        </div>
                        <div>
                          <p
                            className={`font-semibold ${selectedRole === 'student' ? 'text-primary-900' : 'text-gray-900'}`}
                          >
                            Student
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">Learn & Grow</p>
                        </div>
                      </div>
                    </div>
                  </label>

                  <label className="relative group cursor-pointer">
                    <input
                      {...register('role', { required: 'Please select a role' })}
                      type="radio"
                      value="creator"
                      checked={selectedRole === 'creator'}
                      onChange={() => {
                        setSelectedRole('creator');
                        setValue('role', 'creator');
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                        selectedRole === 'creator'
                          ? 'border-primary-600 bg-primary-50/50 ring-1 ring-primary-600 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div
                          className={`p-2 rounded-lg ${selectedRole === 'creator' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500 group-hover:text-gray-700'}`}
                        >
                          <UserCheck className="h-6 w-6" />
                        </div>
                        <div>
                          <p
                            className={`font-semibold ${selectedRole === 'creator' ? 'text-primary-900' : 'text-gray-900'}`}
                          >
                            Creator
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">Teach & Earn</p>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
                {errors.role && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center animate-fade-in">
                    <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    First Name
                  </label>
                  <input
                    {...register('firstName', {
                      required: 'First name is required',
                      minLength: {
                        value: 2,
                        message: 'Min 2 chars',
                      },
                    })}
                    type="text"
                    className="input bg-gray-50/50 focus:bg-white transition-all duration-200"
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Last Name
                  </label>
                  <input
                    {...register('lastName', {
                      required: 'Last name is required',
                      minLength: {
                        value: 2,
                        message: 'Min 2 chars',
                      },
                    })}
                    type="text"
                    className="input bg-gray-50/50 focus:bg-white transition-all duration-200"
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  autoComplete="email"
                  className="input bg-gray-50/50 focus:bg-white transition-all duration-200"
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center animate-fade-in">
                    <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative group">
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Min 6 chars',
                      },
                    })}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="input w-full pr-10 bg-gray-50/50 focus:bg-white transition-all duration-200"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center animate-fade-in">
                    <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {errors.root && (
              <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 animate-fade-in">
                <p className="text-sm text-red-600 text-center font-medium">
                  {errors.root.message}
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                {isLoading && isFirstAttempt ? (
                  <WarmupLoader label="Creating account..." />
                ) : isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{' '}
                <a
                  href="#"
                  className="text-primary-600 hover:text-primary-500 font-medium hover:underline"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="#"
                  className="text-primary-600 hover:text-primary-500 font-medium hover:underline"
                >
                  Privacy Policy
                </a>
              </p>
              <p className="mt-4 text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                >
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

export default Register;
