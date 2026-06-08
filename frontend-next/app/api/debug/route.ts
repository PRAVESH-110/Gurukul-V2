import { NextResponse } from 'next/server';
import { serverGet } from '@/lib/serverFetch';

export async function GET() {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_URL_PROD: process.env.NEXT_PUBLIC_API_URL_PROD,
  };

  const testId = '6a13cefa38a07d1808d40099';
  
  // Try fetching the course using serverGet
  const courseRes = await serverGet(`/courses/${testId}`);
  const videosRes = await serverGet(`/courses/${testId}/videos`);

  // Also try direct fetch
  let directFetch = null;
  let directFetchError = null;
  const directUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/courses/${testId}`;
  try {
    const res = await fetch(directUrl);
    directFetch = {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
    };
  } catch (err: any) {
    directFetchError = err.message;
  }

  return NextResponse.json({
    env,
    courseRes,
    videosRes,
    directUrl,
    directFetch,
    directFetchError,
  });
}
