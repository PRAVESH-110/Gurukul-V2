'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import WarmupLoader from '@/components/UI/WarmupLoader';
import logo from '@/assets/logo.png';

function LoginInner() {
  const { login } = useAuth();
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const from = searchParams.get('from') || searchParams.get('redirect') || '/dashboard';

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        // Mark server as warm on success
        sessionStorage.setItem('server_warm', 'true');
        setIsFirstAttempt(false);
        router.push(from);
      } else {
        setIsFirstAttempt(false); // Validation error — not a cold start
        setError('root', { message: result.message || 'Invalid credentials' });
      }
    } catch (error) {
      if (isFirstAttempt && error?.silent) {
        // Silent cold-start failure — just reset so user can retry
        console.warn('Login cold-start failure, suppressed.');
        setIsFirstAttempt(false);
      } else {
        setError('root', {
          message: error.message || 'An unexpected error occurred',
        });
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
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to continue your learning journey
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
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
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center animate-fade-in">
                    <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="text-sm">
                    <Link
                      href="/forgot-password"
                      className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <div className="relative group">
                  <input
                    {...register('password', {
                      required: 'Password is required',
                    })}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="input w-full pr-10 bg-gray-50/50 focus:bg-white transition-all duration-200"
                    placeholder="Enter your password"
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
                  <WarmupLoader label="Signing in..." />
                ) : isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// This is what Next uses as the page component:
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
