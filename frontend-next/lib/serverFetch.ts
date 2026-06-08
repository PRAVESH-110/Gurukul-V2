/**
 * Server-side fetch helper for RSC data fetching.
 * Only used in page.tsx server components — never in 'use client' files.
 * Does NOT use axios, localStorage, or any browser API.
 */

import { cookies } from 'next/headers';

const getApiBase = () =>
    process.env.NODE_ENV === 'development'
        ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
        : process.env.NEXT_PUBLIC_API_URL_PROD || 'https://gurukul-04ad.onrender.com/api';

type FetchOptions = {
    params?: Record<string, string | number | boolean | undefined>;
    revalidate?: number; // seconds, 0 = no-store, undefined = default Next.js cache
};

/**
 * GET a public API endpoint from the server side.
 * Returns the parsed JSON body, or null on any error.
 */
export async function serverGet<T = unknown>(
    path: string,
    { params, revalidate }: FetchOptions = {}
): Promise<T | null> {
    try {
        const url = new URL(`${getApiBase()}${path}`);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    url.searchParams.set(key, String(value));
                }
            });
        }

        const headers: Record<string, string> = {
            'Accept': 'application/json',
        };

        try {
            const cookieStore = await cookies();
            const token = cookieStore.get('token')?.value;
            if (token) {
                headers['Cookie'] = `token=${token}`;
            }
        } catch (cookieErr) {
            // cookies() can throw when evaluated during static pre-rendering build phase.
            // We ignore it and perform the request anonymously.
        }

        const res = await fetch(url.toString(), {
            headers,
            // revalidate: 0 → no-store (always fresh)
            // revalidate: N → ISR every N seconds
            // undefined  → Next.js default (full-route cache)
            next: revalidate !== undefined ? { revalidate } : undefined,
        });

        if (!res.ok) {
            console.error(`[serverGet] Non-ok status: ${res.status} ${res.statusText} for ${url.toString()}`);
            return null;
        }
        return (await res.json()) as T;
    } catch (error) {
        console.error(`[serverGet] Fetch failed for ${url.toString()}:`, error);
        return null;
    }
}
