import React from 'react';
import { motion } from 'framer-motion';

interface EyeHealthScoreProps {
  score: number;
  size?: number;
  showLabel?: boolean;
  className?: string;
}

/** Animated circular progress indicator for Eye Health Score */
export default function EyeHealthScore({
  score,
  size = 160,
  showLabel = true,
  className = '',
}: EyeHealthScoreProps) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return '#10B981'; // green
    if (s >= 60) return '#F59E0B'; // amber
    if (s >= 40) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  const getLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const color = getColor(clampedScore);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={size * 0.08}
          fill="none"
          className="text-neutral-200 dark:text-neutral-700"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={size * 0.08}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <motion.span
          className="text-3xl font-bold"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {clampedScore}
        </motion.span>
        {showLabel && (
          <span className="text-xs text-neutral mt-1 font-medium">{getLabel(clampedScore)}</span>
        )}
      </div>
    </div>
  );
}