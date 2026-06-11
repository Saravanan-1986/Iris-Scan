import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  raised?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}

export default function Card({ children, className = '', raised = false, onClick, ariaLabel }: CardProps) {
  const baseClass = raised ? 'card-raised' : 'card-flat';
  return (
    <div
      className={`${baseClass} p-5 ${onClick ? 'cursor-pointer hover:shadow-card transition-shadow' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {children}
    </div>
  );
}