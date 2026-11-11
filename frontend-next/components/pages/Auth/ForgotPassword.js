'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { authAPI } from '@/services/api';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import WarmupLoader from '@/components/UI/WarmupLoader';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
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

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authAPI.forgotPassword(data.email.trim().toLowerCase());
      if (response.data?.success) {
        sessionStorage.setItem('server_warm', 'true');
        setIsFirstAttempt(false);
        setSubmittedEmail(data.email);
        setIsSuccess(true);
        toast.success('Password reset link sent!');
      } else {
        setIsFirstAttempt(false);
        setError('root', {
          message: response.data?.message || 'Failed to send reset link',
        });
      }
    } catch (error) {
      if (isFirstAttempt && error?.silent) {
        console.warn('Forgot password cold-start failure suppressed.');
        setIsFirstAttempt(false);
      } else {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          'Failed to send reset link. Please try again.';
        setError('root', { message: errorMsg });
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Check your email</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                If an account exists for{' '}
                <span className="font-semibold text-gray-900">{submittedEmail}</span>, we have sent
                a password reset link to it. Please check your inbox and spam folder.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="btn-outline w-full py-2.5 text-sm"
              >
                Try a different email
              </button>

              <Link
                href="/login"
                className="inline-flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="flex justify-center">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 transform hover:scale-105 transition-transform duration-300">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                Forgot password?
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                No worries! Enter your email and we will send you a reset link.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <div className="relative group">
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      id="email"
                      type="email"
                      autoComplete="email"
                      className="input w-full pr-10 bg-gray-50/50 focus:bg-white transition-all duration-200"
                      placeholder="name@example.com"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-500 flex items-center animate-fade-in">
                      <span className="w-1 h-1 rounded-full bg-red-500 mr-2" />
                      {errors.email.message}
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
                      <span>Sending link...</span>
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>

              {isLoading && isFirstAttempt && (
                <div className="pt-2">
                  <WarmupLoader label="Sending reset link..." />
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

export default ForgotPassword;
