'use client';

import { Suspense } from 'react';
import ForgotPassword from '@/components/pages/Auth/ForgotPassword';

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ForgotPassword />
    </Suspense>
  );
}
