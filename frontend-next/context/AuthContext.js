"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(typeof window !== 'undefined' ? localStorage.getItem('token') : null);

    // Set axios default header
    const setAuthToken = (token) => {
        if (token) {
            localStorage.setItem('token', token);
            setToken(token);
        } else {
            localStorage.removeItem('token');
            setToken(null);
        }
    };

    // Login function
    const login = async (email, password) => {
        try {
            const response = await authAPI.login(email, password);

            // Check if the response indicates success
            if (response.data && response.data.success) {
                const { token, user } = response.data;
                setAuthToken(token);
                setUser(user);
                toast.success('Login successful!');
                return { success: true };
            } else {
                // Handle API-level errors (e.g., invalid credentials)
                const message = response.data?.message || 'Login failed';
                toast.error(message);
                return { success: false, message };
            }
        } catch (error) {
            // Handle network errors or other exceptions
            const message = error.response?.data?.message || 'An error occurred during login';
            toast.error(message);
            return { success: false, message };
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            const { token, user } = response.data;

            setAuthToken(token);
            setUser(user);

            toast.success('Registration successful!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            // Continue with logout even if API call fails
        } finally {
            setAuthToken(null);
            setUser(null);
            toast.success('Logged out successfully');
        }
    };

    // Update profile function
    const updateProfile = async (profileData) => {
        try {
            const response = await authAPI.updateProfile(profileData);
            setUser(response.data.user);
            toast.success('Profile updated successfully!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Profile update failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    // Helper to update user state locally
    const updateUser = (userData) => {
        setUser(prev => ({
            ...prev,
            ...userData
        }));
    };

    // Load user on app start
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const response = await authAPI.getProfile();
                    setUser(response.data.user);
                } catch (error) {
                    // Token is invalid, remove it
                    setAuthToken(null);
                }
            }
            setLoading(false);
        };

        loadUser();
    }, [token]);

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updateUser,
        setUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
