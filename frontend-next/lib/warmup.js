import axios from "axios";

export async function warmUpBackend() {
    try {
        // Get the API URL from environment matching api.js logic
        let apiUrl = process.env.NEXT_PUBLIC_API_URL_PROD ||
            process.env.NEXT_PUBLIC_API_URL ||
            'https://gurukul-04ad.onrender.com/api'; // Fallback to production URL

        // Remove trailing slash if present
        if (apiUrl.endsWith('/')) {
            apiUrl = apiUrl.slice(0, -1);
        }

        // Construct base URL by removing '/api' suffix if present to hit root /health
        const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;

        console.log(`Warming up backend at ${baseUrl}/health...`);

        await axios.get(
            baseUrl + "/health",
            { timeout: 8000 } // Short timeout to not block too long
        );
        console.log("Backend warm-up successful");
    } catch (e) {
        // Swallow error - we don't want to crash the app if warmup fails
        // It might just mean the server is already up or there's a network issue
        // which the actual data fetch will handle/retry
        console.warn("Backend warm-up failed (non-fatal):", e.message);
    }
}
