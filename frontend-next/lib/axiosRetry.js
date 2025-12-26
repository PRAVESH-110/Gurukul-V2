import axios from "axios";

/**
 * Wrapper for axios calls to add retry logic for SSR.
 * @param {Function} fn - Function that returns a Promise (the axios call)
 * @param {number} retries - Number of retries (default 2)
 * @returns {Promise<any>}
 */
export async function axiosWithRetry(
    fn,
    retries = 2
) {
    try {
        return await fn();
    } catch (err) {
        if (retries === 0) throw err;
        console.log(`Request failed, retrying... (${retries} attempts left)`);
        await new Promise(r => setTimeout(r, 2000));
        return axiosWithRetry(fn, retries - 1);
    }
}
