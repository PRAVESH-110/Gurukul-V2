'use client';

import { Suspense } from 'react';
import Register from '@/components/pages/Auth/Register';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Register />
    </Suspense>
  );
}
