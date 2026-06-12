import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Condition } from '@/types';

interface ConditionCardProps {
  condition: Condition;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

/** Card displaying a single detected condition with confidence, risk badge, and expandable details */
export default function ConditionCard({
  condition,
  index,
  isExpanded,
  onToggle,
}: ConditionCardProps) {
  const riskColors: Record<string, { bg: string; text: string; border: string }> = {
    Low: { bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/30' },
    Medium: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' },
    High: { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-300/30' },
    Critical: { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/30' },
  };

  const colors = riskColors[condition.risk] || riskColors.Low;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`glass-card rounded-xl border ${colors.border} overflow-hidden cursor-pointer`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onToggle(); }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-text-primary dark:text-white truncate">
            {condition.name}
          </h3>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <span className="text-sm font-bold text-text-primary dark:text-white">
            {condition.confidence}%
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
            {condition.risk}
          </span>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="px-4 pb-2">
        <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: colors.text.replace('text-', '').split(' ')[0] || '#10B981' }}
            initial={{ width: 0 }}
            animate={{ width: `${condition.confidence}%` }}
            transition={{ duration: 1, delay: index * 0.15 }}
          />
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-neutral-200 dark:border-neutral-700"
          >
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-neutral uppercase tracking-wider mb-1">
                  What this means
                </p>
                <p className="text-sm text-text-primary dark:text-white">
                  {condition.meaning}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral uppercase tracking-wider mb-1">
                  What you should do
                </p>
                <p className="text-sm text-text-primary dark:text-white">
                  {condition.what_to_do}
                </p>
              </div>
              {condition.description && (
                <div>
                  <p className="text-xs font-medium text-neutral uppercase tracking-wider mb-1">
                    Description
                  </p>
                  <p className="text-sm text-neutral">
                    {condition.description}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Badge variant for condition risk level */
export function RiskBadge({ risk }: { risk: string }) {
  const variants: Record<string, string> = {
    Low: 'bg-secondary/10 text-secondary border-secondary/30',
    Medium: 'bg-warning/10 text-warning border-warning/30',
    High: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-300/30',
    Critical: 'bg-danger/10 text-danger border-danger/30',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[risk] || variants.Low}`}>
      {risk}
    </span>
  );
}