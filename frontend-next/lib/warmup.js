import axios from 'axios';

let clientWarmupAttempted = false;

export async function warmUpBackend() {
  try {
    // Get the API URL from environment matching api.js logic
    let apiUrl =
      process.env.NODE_ENV === 'development'
        ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
        : process.env.NEXT_PUBLIC_API_URL_PROD || 'https://gurukul-04ad.onrender.com/api';

    // Remove trailing slash if present
    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.slice(0, -1);
    }

    // Construct base URL by removing '/api' suffix if present to hit root /health
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;

    console.log(`Warming up backend at ${baseUrl}/health...`);

    await axios.get(baseUrl + '/health', { timeout: 20000 });
    console.log('Backend warm-up successful');

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('server_warm', 'true');
    }
  } catch (e) {
    // Swallow error - we don't want to crash the app if warmup fails
    // It might just mean the server is already up or there's a network issue
    // which the actual data fetch will handle/retry
    console.warn('Backend warm-up failed (non-fatal):', e.message);
  }
}

/**
 * Triggers backend warm-up from the browser client on first visit
 */
export function warmUpBackendClient() {
  if (typeof window === 'undefined' || clientWarmupAttempted) return;
  if (sessionStorage.getItem('server_warm')) return;

  clientWarmupAttempted = true;
  warmUpBackend();
}
