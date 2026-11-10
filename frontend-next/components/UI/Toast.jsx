'use client';

import React from 'react';
import toast, { Toaster as HotToaster } from 'react-hot-toast';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, Loader2 } from 'lucide-react';

/**
 * Toast variant styles & default icons
 */
const TOAST_VARIANTS = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/80',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-900 dark:text-emerald-100',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  error: {
    bg: 'bg-rose-50 dark:bg-rose-950/80',
    border: 'border-rose-200 dark:border-rose-800',
    text: 'text-rose-900 dark:text-rose-100',
    iconColor: 'text-rose-600 dark:text-rose-400',
    Icon: AlertCircle,
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/80',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-900 dark:text-amber-100',
    iconColor: 'text-amber-600 dark:text-amber-400',
    Icon: AlertTriangle,
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/80',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-100',
    iconColor: 'text-blue-600 dark:text-blue-400',
    Icon: Info,
  },
  loading: {
    bg: 'bg-slate-50 dark:bg-slate-900',
    border: 'border-slate-200 dark:border-slate-800',
    text: 'text-slate-900 dark:text-slate-100',
    iconColor: 'text-primary-600 animate-spin',
    Icon: Loader2,
  },
};

/**
 * Single Responsibility: Presentational component for rendering a structured notification card
 */
export function ToastNotification({
  type = 'info',
  title,
  message,
  action,
  t, // toast instance from react-hot-toast if rendered custom
  onClose,
}) {
  const variant = TOAST_VARIANTS[type] || TOAST_VARIANTS.info;
  const IconComponent = variant.Icon;

  const handleDismiss = () => {
    if (onClose) {
      onClose();
    } else if (t?.id) {
      toast.dismiss(t.id);
    }
  };

  return (
    <div
      className={`
        pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md
        transition-all duration-300 ease-out
        ${variant.bg} ${variant.border}
      `}
      role="alert"
    >
      <div className={`mt-0.5 flex-shrink-0 ${variant.iconColor}`}>
        <IconComponent className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0 pr-1">
        {title && (
          <h4 className={`text-sm font-semibold tracking-tight ${variant.text}`}>{title}</h4>
        )}
        {message && (
          <p
            className={`text-xs sm:text-sm leading-relaxed mt-0.5 ${
              title ? 'opacity-90' : 'font-medium'
            } ${variant.text}`}
          >
            {message}
          </p>
        )}
        {action && (
          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                action.onClick?.();
                handleDismiss();
              }}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
            >
              {action.label}
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Close notification"
        className="flex-shrink-0 -mr-1 -mt-1 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Dependency Inversion & Open-Closed: High-level toast helper facade
 * Provides a clean, type-safe API anywhere in the app without coupling
 * components to react-hot-toast implementation details.
 */
export const showToast = {
  success(message, options = {}) {
    return toast.custom(
      (t) => (
        <ToastNotification
          t={t}
          type="success"
          title={options.title}
          message={message}
          action={options.action}
        />
      ),
      { duration: options.duration || 4000, id: options.id },
    );
  },

  error(message, options = {}) {
    return toast.custom(
      (t) => (
        <ToastNotification
          t={t}
          type="error"
          title={options.title || 'Error'}
          message={
            typeof message === 'string' ? message : message?.message || 'Something went wrong'
          }
          action={options.action}
        />
      ),
      { duration: options.duration || 5000, id: options.id },
    );
  },

  warning(message, options = {}) {
    return toast.custom(
      (t) => (
        <ToastNotification
          t={t}
          type="warning"
          title={options.title}
          message={message}
          action={options.action}
        />
      ),
      { duration: options.duration || 4500, id: options.id },
    );
  },

  info(message, options = {}) {
    return toast.custom(
      (t) => (
        <ToastNotification
          t={t}
          type="info"
          title={options.title}
          message={message}
          action={options.action}
        />
      ),
      { duration: options.duration || 4000, id: options.id },
    );
  },

  loading(message, options = {}) {
    return toast.custom(
      (t) => <ToastNotification t={t} type="loading" title={options.title} message={message} />,
      { duration: Infinity, id: options.id },
    );
  },

  promise(promise, messages, options = {}) {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: (data) =>
          typeof messages.success === 'function' ? messages.success(data) : messages.success,
        error: (err) =>
          typeof messages.error === 'function'
            ? messages.error(err)
            : err?.response?.data?.message || err?.message || messages.error || 'Failed',
      },
      {
        ...options,
        style: {
          borderRadius: '16px',
          background: '#1f2937',
          color: '#f9fafb',
          fontSize: '14px',
        },
      },
    );
  },

  dismiss(toastId) {
    toast.dismiss(toastId);
  },
};

/**
 * Universal Toaster container to place in root layout / provider
 */
export function ToastProvider({ position = 'top-center', ...props }) {
  return (
    <HotToaster
      position={position}
      toastOptions={{
        className: 'font-sans',
        duration: 4000,
      }}
      {...props}
    />
  );
}

export default showToast;
