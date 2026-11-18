'use client';

import React from 'react';
import Link from 'next/link';

/**
 * EmptyStateCard matches the Super Admin Prototype's empty states:
 * Refined soft icon container, clear typography hierarchy, and purposeful CTA.
 */
export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white/60 border border-dashed border-slate-200/90 ${className}`}
    >
      {Icon && (
        <div className="mb-3 flex items-center justify-center text-black">
          <Icon className="h-8 w-8 text-black stroke-[1.75]" />
        </div>
      )}
      <h3 className="text-[16px] font-bold text-slate-900 tracking-tight mb-1">{title}</h3>
      {description && (
        <p className="text-[13px] text-slate-500 max-w-sm mb-5 leading-relaxed">{description}</p>
      )}
      {actionText &&
        (actionHref || onAction) &&
        (actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold shadow-xs hover:shadow-sm transition-all duration-150"
          >
            {actionText}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold shadow-xs hover:shadow-sm transition-all duration-150"
          >
            {actionText}
          </button>
        ))}
    </div>
  );
}

export default EmptyStateCard;
