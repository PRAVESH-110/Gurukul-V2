'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import { authAPI } from '@/services/api';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import WarmupLoader from '@/components/UI/WarmupLoader';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFirstAttempt, setIsFirstAttempt] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('server_warm')) {
      setIsFirstAttempt(false);
    }
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    if (!token) {
      setError('root', { message: 'Reset token is missing or invalid' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.resetPassword(token, data.password);
      if (response.data?.success) {
        sessionStorage.setItem('server_warm', 'true');
        setIsFirstAttempt(false);
        setIsSuccess(true);
        toast.success('Password successfully reset!');
      } else {
        setIsFirstAttempt(false);
        setError('root', {
          message: response.data?.message || 'Failed to reset password',
        });
      }
    } catch (error) {
      if (isFirstAttempt && error?.silent) {
        console.warn('Reset password cold-start failure suppressed.');
        setIsFirstAttempt(false);
      } else {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          'Failed to reset password. The link may have expired.';
        setError('root', { message: errorMsg });
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-md w-full text-center space-y-6 bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-sm border border-red-100">
              <AlertCircle className="w-8 h-8" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Invalid Reset Link</h2>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/forgot-password"
              className="btn-primary w-full py-3 inline-block text-center"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary-100/50 blur-3xl opacity-60 animate-fade-in" />
        <div
          className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl opacity-60 animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        />
      </div>

      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20 animate-slide-up">
        {isSuccess ? (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shadow-sm border border-green-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Password Reset!</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Your password has been successfully updated. You can now sign in with your new
                credentials.
              </p>
            </div>

            <div className="pt-4">
              <Link
                href="/login"
                className="btn-primary w-full py-3 inline-block text-center shadow-lg shadow-primary/25 hover:shadow-primary/35"
              >
                Proceed to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="flex justify-center">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 transform hover:scale-105 transition-transform duration-300">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                Set new password
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Your new password must be at least 8 characters long.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    New password
                  </label>
                  <div className="relative group">
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters',
                        },
                      })}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="input w-full pr-10 bg-gray-50/50 focus:bg-white transition-all duration-200"
                      placeholder="••••••••"
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
                      <span className="w-1 h-1 rounded-full bg-red-500 mr-2" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Confirm new password
                  </label>
                  <div className="relative group">
                    <input
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => value === password || 'Passwords do not match',
                      })}
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="input w-full pr-10 bg-gray-50/50 focus:bg-white transition-all duration-200"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-sm text-red-500 flex items-center animate-fade-in">
                      <span className="w-1 h-1 rounded-full bg-red-500 mr-2" />
                      {errors.confirmPassword.message}
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
                  className="btn-primary w-full py-3 text-base shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center relative overflow-hidden"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="sm" color="white" />
                      <span>Resetting password...</span>
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>

              {isLoading && isFirstAttempt && (
                <div className="pt-2">
                  <WarmupLoader label="Resetting password..." />
                </div>
              )}

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5 text-gray-400" /> Back to sign in
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
