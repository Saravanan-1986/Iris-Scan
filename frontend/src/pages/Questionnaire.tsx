import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useScanStore } from '@/store/useScanStore';
import Button from '@/components/UI/Button';
import ProgressBar from '@/components/UI/ProgressBar';

type QuestionKey = 'eyePain' | 'visionStatus' | 'lightSensitivity' | 'rednessLevel' | 'discharge' | 'itchingBurning' | 'symptomDuration';

const questions: { key: QuestionKey; options: string[] }[] = [
  { key: 'eyePain', options: ['none', 'mild', 'moderate', 'severe'] },
  { key: 'visionStatus', options: ['normal', 'slightlyBlurred', 'veryBlurred', 'blindSpots'] },
  { key: 'lightSensitivity', options: ['none', 'mild', 'intolerable'] },
  { key: 'rednessLevel', options: ['no', 'slight', 'veryRed'] },
  { key: 'discharge', options: ['no', 'watery', 'thick'] },
  { key: 'itchingBurning', options: ['none', 'mild', 'intense'] },
  { key: 'symptomDuration', options: ['newToday', 'fewDays', 'weeks', 'months'] },
];

export default function Questionnaire() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { symptoms, setSymptoms, runAnalysis } = useScanStore();

  const [currentQ, setCurrentQ] = useState(0);
  const [showFollowUp, setShowFollowUp] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQ];

  const handleAnswer = (value: string) => {
    setSymptoms({ [currentQuestion.key]: value });

    if (currentQuestion.key === 'eyePain' && value === 'severe') {
      setShowFollowUp(true);
      return;
    }

    if (showFollowUp && currentQuestion.key === 'eyePain') {
      setShowFollowUp(false);
      proceedNext();
      return;
    }

    proceedNext();
  };

  const handleFollowUp = (value: string) => {
    setSymptoms({ painConstant: value as 'constant' | 'intermittent' });
    setShowFollowUp(false);
    proceedNext();
  };

  const proceedNext = () => {
    if (currentQ < totalQuestions - 1) {
      setCurrentQ((p) => p + 1);
    } else {
      runAnalysis().then(() => navigate('/results'));
    }
  };

  const handlePrevious = () => {
    if (currentQ > 0) setCurrentQ((p) => p - 1);
    else navigate('/capture');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-sm text-neutral mb-3">{t('questionnaire.progress', { current: currentQ + 1, total: totalQuestions })}</p>
        <ProgressBar value={(currentQ + 1) / totalQuestions * 100} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={showFollowUp ? 'followup' : currentQ}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          {showFollowUp ? (
            <div className="card-raised p-6">
              <h2 className="text-base font-medium text-text-primary dark:text-white mb-6">
                {t('questionnaire.questions.eyePain.followUp')}
              </h2>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => handleFollowUp('constant')}>
                  {t('questionnaire.questions.eyePain.constant')}
                </Button>
                <Button variant="outline" onClick={() => handleFollowUp('intermittent')}>
                  {t('questionnaire.questions.eyePain.intermittent')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="card-raised p-6">
              <h2 className="text-base font-medium text-text-primary dark:text-white mb-6">
                {t(`questionnaire.questions.${currentQuestion.key}.text`)}
              </h2>
              <div className="space-y-2">
                {currentQuestion.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className={`w-full text-left px-4 py-3 rounded-input text-sm transition-colors border ${
                      (symptoms as Record<string, string>)[currentQuestion.key] === opt
                        ? 'border-primary bg-primary-50 text-primary dark:bg-primary-900/20 dark:text-primary-300'
                        : 'border-neutral-200 dark:border-neutral-700 text-text-primary dark:text-white hover:border-primary'
                    }`}
                  >
                    {t(`questionnaire.questions.${currentQuestion.key}.${opt}`)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        <Button variant="ghost" onClick={handlePrevious}>
          {t('questionnaire.previous')}
        </Button>
        {currentQ === totalQuestions - 1 && !showFollowUp && (
          <Button onClick={() => runAnalysis().then(() => navigate('/results'))}>
            {t('questionnaire.submit')}
          </Button>
        )}
      </div>
    </div>
  );
}