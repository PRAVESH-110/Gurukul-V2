'use client';

import { Suspense } from 'react';
import Login from '@/components/pages/Auth/Login';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Login />
    </Suspense>
  );
}
