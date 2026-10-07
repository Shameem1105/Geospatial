import React from 'react';

export interface StatusBadgeProps {
  value?: string;
  status?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  value,
  status,
  size = 'md',
  className = '',
}) => {
  const text = value || status || 'Unknown';
  const normalized = text.toLowerCase();
  let kind = 'neutral';

  if (
    normalized === 'completed' ||
    normalized === 'calculated' ||
    normalized === 'ready' ||
    normalized === 'operational' ||
    normalized === 'success'
  ) {
    kind = 'success';
  } else if (
    normalized === 'processing' ||
    normalized === 'active' ||
    normalized === 'pending' ||
    normalized === 'uploading' ||
    normalized === 'validating' ||
    normalized === 'parsing'
  ) {
    kind = 'processing';
  } else if (
    normalized === 'failed' ||
    normalized === 'error' ||
    normalized === 'unsupported'
  ) {
    kind = 'error';
  }

  const sizeClass = size === 'sm' ? 'text-[8px] py-0.5 px-2' : '';

  return (
    <span className={`status ${kind} ${sizeClass} ${className}`}>
      <span />
      {text}
    </span>
  );
};

export const Status = StatusBadge;
