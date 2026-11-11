'use client';

import { Suspense } from 'react';
import ResetPassword from '@/components/pages/Auth/ResetPassword';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ResetPassword />
    </Suspense>
  );
}
