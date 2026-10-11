export const ACCESS_TOKEN_KEY = 'gurukul.accessToken';
export const CSRF_TOKEN_KEY = 'gurukul.csrfToken';

export const readStoredTokens = () => {
  if (typeof window === 'undefined') return { accessToken: null, csrfToken: null };
  return {
    accessToken: window.localStorage.getItem(ACCESS_TOKEN_KEY),
    csrfToken: window.localStorage.getItem(CSRF_TOKEN_KEY),
  };
};

export const persistTokens = (accessToken, csrfToken) => {
  if (typeof window === 'undefined') return;
  if (accessToken) window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  else window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  if (csrfToken) window.localStorage.setItem(CSRF_TOKEN_KEY, csrfToken);
  else window.localStorage.removeItem(CSRF_TOKEN_KEY);
};

export const persistCsrfToken = (csrfToken) => {
  if (typeof window !== 'undefined' && csrfToken) {
    window.localStorage.setItem(CSRF_TOKEN_KEY, csrfToken);
  }
};

export const clearStoredTokens = () => persistTokens(null, null);
