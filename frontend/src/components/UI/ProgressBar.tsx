import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  animated?: boolean;
  variant?: 'primary' | 'secondary' | 'warning' | 'danger';
}

const variantClasses = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

export default function ProgressBar({
  value,
  max = 100,
  className = '',
  animated = true,
  variant = 'primary',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${variantClasses[variant]} ${animated ? 'ease-out' : ''}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}