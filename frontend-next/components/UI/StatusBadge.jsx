'use client';

import React from 'react';

/**
 * StatusBadge styled like Super Admin Prototype status pills
 */
export function StatusBadge({ status, label, className = '' }) {
  const norm = (status || '').toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200/80';
  let dotColor = 'bg-slate-400';

  if (norm === 'active' || norm === 'published' || norm === 'completed' || norm === 'public') {
    styles = 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
    dotColor = 'bg-emerald-500';
  } else if (norm === 'in-progress' || norm === 'draft' || norm === 'pending' || norm === 'trial') {
    styles = 'bg-amber-500/10 text-amber-700 border-amber-500/20';
    dotColor = 'bg-amber-500';
  } else if (norm === 'private' || norm === 'inactive' || norm === 'archived') {
    styles = 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    dotColor = 'bg-slate-400';
  } else if (norm === 'failed' || norm === 'cancelled') {
    styles = 'bg-rose-500/10 text-rose-700 border-rose-500/20';
    dotColor = 'bg-rose-500';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="capitalize">{label || status}</span>
    </span>
  );
}

export default StatusBadge;
