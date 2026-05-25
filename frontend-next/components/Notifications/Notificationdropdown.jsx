'use client';

import React, { useState, useEffect } from 'react';
import {
    Bell,
    BookOpen,
    Users,
    Trash2,
    Check,
    CheckCheck,
    Loader2
} from 'lucide-react';
import { notificationAPI } from '@/services/api';
import toast from 'react-hot-toast';

const NotificationDropdown = ({ isOpen, onClose, unreadCount, setUnreadCount }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await notificationAPI.getNotifications();
            if (res.data && res.data.success) {
                setNotifications(res.data.data);
            }
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    // Automatically mark notifications as read when scrolled into view
    useEffect(() => {
        if (!isOpen || notifications.length === 0) return;

        // Select all unread notification DOM elements inside the dropdown
        const unreadElements = document.querySelectorAll('[data-notification-unread="true"]');
        if (unreadElements.length === 0) return;

        const timers = {}; // To store setTimeout timers for each notification

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.getAttribute('data-id');
                if (entry.isIntersecting) {
                    // Trigger mark read after 1 seconds of static visibility
                    timers[id] = setTimeout(() => {
                        autoMarkAsRead(id);
                    }, 1000);
                } else {
                    // Cancel timer if it leaves viewport before the delay expires
                    if (timers[id]) {
                        clearTimeout(timers[id]);
                        delete timers[id];
                    }
                }
            });
        }, {
            root: document.querySelector('.max-h-96'), // Observe relative to the scrollable wrapper
            threshold: 0.8 // Require 80% visibility to trigger
        });

        unreadElements.forEach(el => observer.observe(el));

        return () => {
            observer.disconnect();
            Object.values(timers).forEach(clearTimeout);
        };
    }, [notifications, isOpen]);

    const autoMarkAsRead = async (id) => {
        try {
            const res = await notificationAPI.markAsRead(id);
            if (res.data && res.data.success) {
                setNotifications(prev =>
                    prev.map(notif => notif._id === id ? { ...notif, isRead: true } : notif)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to auto-mark notification as read:', err);
        }
    };

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation(); // Avoid triggering any parent click
        try {
            const res = await notificationAPI.markAsRead(id);
            if (res.data && res.data.success) {
                setNotifications(prev =>
                    prev.map(notif => notif._id === id ? { ...notif, isRead: true } : notif)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const res = await notificationAPI.markAllAsRead();
            if (res.data && res.data.success) {
                setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
                setUnreadCount(0);
                toast.success('All notifications marked as read');
            }
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        try {
            const notifToDelete = notifications.find(n => n._id === id);
            const res = await notificationAPI.deleteNotification(id);
            if (res.data && res.data.success) {
                setNotifications(prev => prev.filter(notif => notif._id !== id));
                if (notifToDelete && !notifToDelete.isRead) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
                toast.success('Notification deleted');
            }
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'COURSE_CREATION':
            case 'NEW_COURSE':
                return <BookOpen className="h-5 w-5 text-blue-600" />;
            case 'ENROLLMENT':
            case 'ENROLLMENT_CREATOR':
                return <BookOpen className="h-5 w-5 text-orange-600" />;
            case 'COMMUNITY_JOIN':
            case 'COMMUNITY_JOIN_CREATOR':
                return <Users className="h-5 w-5 text-purple-600" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'COURSE_CREATION':
            case 'NEW_COURSE':
                return 'bg-blue-50';
            case 'ENROLLMENT':
            case 'ENROLLMENT_CREATOR':
                return 'bg-orange-50';
            case 'COMMUNITY_JOIN':
            case 'COMMUNITY_JOIN_CREATOR':
                return 'bg-purple-50';
            default:
                return 'bg-gray-50';
        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    if (!isOpen) return null;

    return (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in origin-top-right">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">Notifications</span>
                    {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-primary-100 text-primary-800 rounded-full">
                            {unreadCount} new
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center space-x-1"
                    >
                        <CheckCheck className="h-3.5 w-3.5 mr-0.5" />
                        <span>Mark all read</span>
                    </button>
                )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-2">
                        <Loader2 className="h-6 w-6 text-primary-500 animate-spin" />
                        <span className="text-xs text-gray-500">Loading notifications...</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                            <Bell className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-950">All caught up!</p>
                        <p className="text-xs text-gray-500 mt-1">You will see live platform alerts here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notif) => (
                            <div
                                key={notif._id}
                                data-id={notif._id}
                                data-notification-unread={!notif.isRead}
                                className={`flex items-start p-4 hover:bg-gray-50/80 transition-colors group relative ${!notif.isRead ? 'bg-primary-50/30' : ''}`}
                            >
                                {/* Left Side Icon */}
                                <div className={`p-2 rounded-xl shrink-0 mr-3 ${getBgColor(notif.type)}`}>
                                    {getIcon(notif.type)}
                                </div>

                                {/* Content and Time */}
                                <div className="flex-1 min-w-0 pr-8">
                                    <p className={`text-xs sm:text-sm text-gray-900 leading-normal ${!notif.isRead ? 'font-semibold' : 'font-normal'}`}>
                                        {notif.content}
                                    </p>
                                    <span className="text-[10px] text-gray-400 mt-1 block">
                                        {formatTime(notif.createdAt)}
                                    </span>
                                </div>

                                {/* Right Side Actions (Mark as Read / Delete) */}
                                <div className="absolute right-3 top-4 flex items-center space-x-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!notif.isRead && (
                                        <button
                                            onClick={(e) => handleMarkAsRead(notif._id, e)}
                                            className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Mark as read"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => handleDelete(notif._id, e)}
                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete notification"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Unread Dot (if no hover) */}
                                {!notif.isRead && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full group-hover:hidden shadow-sm" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
