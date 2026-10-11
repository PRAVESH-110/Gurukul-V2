'use client';

import React, { createContext, useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authAPI, refreshAccessSession } from '@/services/api';
import {
  clearCredentials,
  setCredentials,
  setInitialized,
  setUser as setReduxUser,
} from './store/authSlice';
import {
  ACCESS_TOKEN_KEY,
  CSRF_TOKEN_KEY,
  clearStoredTokens,
  persistTokens,
  readStoredTokens,
} from './authStorage';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);
let sessionRestorePromise = null;

const restoreSession = async () => {
  const { accessToken } = readStoredTokens();
  try {
    if (accessToken) {
      const profileResponse = await authAPI.getProfile();
      if (profileResponse.status === 200 && profileResponse.data?.success) {
        return profileResponse.data.user;
      }
      return null;
    }

    await refreshAccessSession();
    const profileResponse = await authAPI.getProfile();
    return profileResponse.status === 200 && profileResponse.data?.success
      ? profileResponse.data.user
      : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, accessToken, csrfToken, initialized } = useSelector((state) => state.auth);

  useEffect(() => {
    let active = true;
    if (!sessionRestorePromise) {
      sessionRestorePromise = restoreSession().finally(() => { sessionRestorePromise = null; });
    }
    sessionRestorePromise.then((restoredUser) => {
      if (!active) return;
      if (restoredUser) {
        const tokens = readStoredTokens();
        dispatch(setCredentials({ ...tokens, user: restoredUser }));
      } else {
        clearStoredTokens();
        dispatch(clearCredentials());
      }
    }).finally(() => {
      if (active) dispatch(setInitialized(true));
    });

    return () => { active = false; };
  }, [dispatch]);

  useEffect(() => {
    const syncStorageTokens = (event) => {
      if (event.key !== ACCESS_TOKEN_KEY && event.key !== CSRF_TOKEN_KEY) return;
      const tokens = readStoredTokens();
      if (tokens.accessToken) dispatch(setAuthTokens(tokens));
      else dispatch(clearCredentials());
    };

    window.addEventListener('storage', syncStorageTokens);
    return () => window.removeEventListener('storage', syncStorageTokens);
  }, [dispatch]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      if (response.data?.success) {
        const session = response.data;
        persistTokens(session.accessToken, session.csrfToken);
        dispatch(setCredentials(session));
        toast.success('Login successful!');
        return { success: true };
      }
      const message = response.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'An error occurred during login';
      toast.error(message);
      return { success: false, message };
    }
  }, [dispatch]);

  const register = useCallback(async (userData) => {
    try {
      const response = await authAPI.register(userData);
      if (!response.data?.success) {
        return { success: false, message: response.data?.message || 'Registration failed' };
      }
      persistTokens(response.data.accessToken, response.data.csrfToken);
      dispatch(setCredentials(response.data));
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // Local logout still completes if the API is unavailable.
    } finally {
      clearStoredTokens();
      dispatch(clearCredentials());
      toast.success('Logged out successfully');
    }
  }, [dispatch]);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      if (response.data?.success) {
        dispatch(setReduxUser(response.data.user));
        toast.success('Profile updated successfully!');
        return { success: true };
      }
      return { success: false, message: response.data?.message || 'Profile update failed' };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  }, [dispatch]);

  const updateUser = useCallback((userData) => {
    dispatch(setReduxUser({ ...user, ...userData }));
  }, [dispatch, user]);

  const setUser = useCallback((value) => {
    dispatch(setReduxUser(typeof value === 'function' ? value(user) : value));
  }, [dispatch, user]);

  const value = {
    user,
    token: accessToken,
    accessToken,
    csrfToken,
    loading: !initialized,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
