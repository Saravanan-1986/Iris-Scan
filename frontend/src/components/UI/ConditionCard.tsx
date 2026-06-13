import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Condition } from '@/types';

interface ConditionCardProps {
  condition: Condition;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

/** Card displaying a single detected condition with confidence, risk badge, explanation, and expandable details */
export default function ConditionCard({
  condition,
  index,
  isExpanded,
  onToggle,
}: ConditionCardProps) {
  const riskColors: Record<string, { bg: string; text: string; border: string; bar: string }> = {
    Low: { bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/30', bar: '#10B981' },
    Medium: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30', bar: '#F59E0B' },
    High: { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-300/30', bar: '#F97316' },
    Critical: { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/30', bar: '#EF4444' },
  };

  const colors = riskColors[condition.risk] || riskColors.Low;
  const hasExplanation = condition.explanation || (condition.affected_regions && condition.affected_regions.length > 0) || (condition.symptom_evidence && condition.symptom_evidence.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`glass-card rounded-xl border ${colors.border} overflow-hidden cursor-pointer transition-shadow hover:shadow-md`}
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
            style={{ backgroundColor: colors.bar }}
            initial={{ width: 0 }}
            animate={{ width: `${condition.confidence}%` }}
            transition={{ duration: 1, delay: index * 0.15 }}
          />
        </div>
      </div>

      {/* Brief explanation preview (always visible) */}
      {condition.explanation && !isExpanded && (
        <div className="px-4 pb-3">
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/20">
            <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-primary-700 dark:text-primary-300 line-clamp-2">{condition.explanation}</p>
          </div>
        </div>
      )}

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
            <div className="p-4 space-y-4">
              {/* Explanation Section */}
              {condition.explanation && (
                <div>
                  <p className="text-xs font-medium text-neutral uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Why we detected this
                  </p>
                  <p className="text-sm text-text-primary dark:text-white leading-relaxed">
                    {condition.explanation}
                  </p>
                </div>
              )}

              {/* Affected Iris Regions */}
              {condition.affected_regions && condition.affected_regions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-neutral uppercase tracking-wider mb-1.5">Affected Iris Regions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {condition.affected_regions.map((region) => (
                      <span
                        key={region}
                        className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-primary-50 dark:bg-primary-900/20 text-primary dark:text-primary-300 border border-primary-200 dark:border-primary-800/30"
                      >
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Symptom Evidence */}
              {condition.symptom_evidence && condition.symptom_evidence.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-neutral uppercase tracking-wider mb-1.5">Supporting Symptoms</p>
                  <ul className="space-y-1">
                    {condition.symptom_evidence.map((evidence, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-primary dark:text-white">
                        <svg className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {evidence}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What this means */}
              <div>
                <p className="text-xs font-medium text-neutral uppercase tracking-wider mb-1">
                  What this means
                </p>
                <p className="text-sm text-text-primary dark:text-white">
                  {condition.meaning}
                </p>
              </div>

              {/* What you should do */}
              <div>
                <p className="text-xs font-medium text-neutral uppercase tracking-wider mb-1">
                  Recommended action
                </p>
                <p className="text-sm text-text-primary dark:text-white">
                  {condition.what_to_do}
                </p>
              </div>

              {/* Description */}
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