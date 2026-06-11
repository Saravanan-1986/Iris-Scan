import React from 'react';
import { SeverityLevel } from '@/types';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'neutral';
  severity?: SeverityLevel;
  children: React.ReactNode;
  className?: string;
}

const severityToVariant: Record<SeverityLevel, 'secondary' | 'warning' | 'danger'> = {
  low: 'secondary',
  moderate: 'warning',
  high: 'danger',
  critical: 'danger',
};

const variantClasses: Record<string, string> = {
  primary: 'bg-primary-50 text-primary dark:bg-primary-900/20 dark:text-primary-300',
  secondary: 'bg-secondary-50 text-secondary dark:bg-secondary-900/20 dark:text-secondary-300',
  warning: 'bg-warning-50 text-warning dark:bg-warning-900/20 dark:text-warning-300',
  danger: 'bg-danger-50 text-danger dark:bg-danger-900/20 dark:text-danger-300',
  neutral: 'bg-neutral-100 text-neutral dark:bg-neutral-800 dark:text-neutral-300',
};

export default function Badge({ variant, severity, children, className = '' }: BadgeProps) {
  const resolvedVariant: string = severity ? severityToVariant[severity] : (variant || 'neutral');
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-pill ${variantClasses[resolvedVariant]} ${className}`}
    >
      {children}
    </span>
  );
}