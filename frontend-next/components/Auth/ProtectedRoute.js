'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '../UI/LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`/login?from=${encodeURIComponent(pathname)}`);
      } else if (requiredRole && user.role !== requiredRole && !(requiredRole === 'creator' && user.role === 'admin')) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, requiredRole, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  if (requiredRole && user.role !== requiredRole && !(requiredRole === 'creator' && user.role === 'admin')) {
    return null;
  }

  return children;
};

export default ProtectedRoute;

