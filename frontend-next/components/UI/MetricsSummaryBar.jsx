'use client';

import React from 'react';

/**
 * Single metric segment matching the Super Admin Prototype.
 * Displays inside a unified surface with subtle vertical hairline dividers.
 */
export function MetricSegment({
  label,
  value,
  trend,
  trendType = 'positive',
  subtitle,
  icon: Icon,
  badgeText,
  badgeColor = 'blue',
  className = '',
}) {
  let badgeStyles = 'bg-blue-500/10 text-blue-700 border border-blue-500/20';
  if (badgeColor === 'emerald' || trendType === 'positive') {
    badgeStyles = 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20';
  } else if (badgeColor === 'purple') {
    badgeStyles = 'bg-purple-500/10 text-purple-700 border border-purple-500/20';
  } else if (badgeColor === 'amber' || trendType === 'warning') {
    badgeStyles = 'bg-amber-500/10 text-amber-700 border border-amber-500/20';
  } else if (badgeColor === 'rose' || trendType === 'negative') {
    badgeStyles = 'bg-rose-500/10 text-rose-700 border border-rose-500/20';
  }

  return (
    <div
      className={`flex-1 flex flex-col justify-center px-6 py-4 first:pl-5 last:pr-5 border-b sm:border-b-0 sm:border-r border-slate-100 last:border-r-0 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="p-1.5 rounded-lg bg-slate-50 text-slate-500 border border-slate-100">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <span className="text-[12.5px] font-semibold text-slate-500 tracking-tight">{label}</span>
        </div>
        {(badgeText || trend) && (
          <span
            className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeStyles}`}
          >
            {badgeText || trend}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2 mt-0.5">
        <span className="text-[26px] font-[800] text-slate-900 leading-none tracking-tight tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      </div>

      {subtitle && (
        <span className="text-[11.5px] text-slate-400 mt-1.5 leading-snug truncate">
          {subtitle}
        </span>
      )}
    </div>
  );
}

/**
 * Unified container surface for metrics.
 * Eliminates isolated disjointed boxes in favor of a clean, bordered strip.
 */
export function MetricsSummaryBar({ children, className = '' }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex flex-col sm:flex-row items-stretch overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

export default MetricsSummaryBar;
