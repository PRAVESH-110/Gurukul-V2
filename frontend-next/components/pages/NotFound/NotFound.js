'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mt-4">Page Not Found</h2>
          <p className="text-gray-600 mt-2 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="btn-primary inline-flex items-center"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Link>
          <button
            onClick={() => router.back()}
            className="btn-outline inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

