import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useScanStore } from '@/store/useScanStore';
import Button from '@/components/UI/Button';

/** Eye alignment guide SVG overlay with animated target rings */
function EyeAlignmentGuide({ guidance, lightingOk, eyeDetected }: {
  guidance: 'center' | 'hold' | 'good';
  lightingOk: boolean | null;
  eyeDetected: boolean;
}) {
  const pulseColor = guidance === 'good' ? '#10B981' : guidance === 'hold' ? '#F59E0B' : '#1A6FD4';
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative w-72 h-72 sm:w-80 sm:h-80">
        <svg viewBox="0 0 300 300" className="w-full h-full" aria-hidden="true">
          {/* Outer guide ring */}
          <circle cx="150" cy="150" r="140" fill="none" stroke="white" strokeWidth="1" opacity="0.2" />
          {/* Detection ring */}
          <circle cx="150" cy="150" r="130" fill="none" stroke="white" strokeWidth="2" opacity="0.5" />
          {/* Animated dashes ring */}
          <circle cx="150" cy="150" r="120" fill="none" stroke={pulseColor} strokeWidth="2" opacity={0.6} strokeDasharray="10 6">
            <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="4s" repeatCount="indefinite" />
          </circle>
          {/* Inner guide rings */}
          <circle cx="150" cy="150" r="60" fill="none" stroke="white" strokeWidth="0.8" opacity="0.3" strokeDasharray="4 4" />
          <circle cx="150" cy="150" r="30" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
          {/* Crosshair */}
          <line x1="140" y1="150" x2="160" y2="150" stroke={pulseColor} strokeWidth="1" opacity="0.5" />
          <line x1="150" y1="140" x2="150" y2="160" stroke={pulseColor} strokeWidth="1" opacity="0.5" />
          {/* Alignment status dot */}
          <circle cx="150" cy="150" r="4" fill={pulseColor} opacity="0.8">
            <animate attributeName="r" values="3;6;3" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
    </div>
  );
}

export default function Capture() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setCapturedImage = useScanStore((s) => s.setCapturedImage);
  const setStep = useScanStore((s) => s.setStep);
  const setScleraRedness = useScanStore((s) => s.setScleraRedness);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [guidance, setGuidance] = useState<'center' | 'hold' | 'good'>('center');
  const [lightingOk, setLightingOk] = useState<boolean | null>(null);
  const [eyeDetected, setEyeDetected] = useState(false);
  const [showDistanceHint, setShowDistanceHint] = useState(false);

  const startCamera = useCallback(async () => {
    setLoading(true);
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setLoading(false);
      setEyeDetected(true);
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setCameraError('camera_permission_denied');
      } else {
        setCameraError('generic');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    const currentStream = streamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.92);
  }, []);

  useEffect(() => {
    return () => {
      const currentStream = streamRef.current;
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Guidance animation
  useEffect(() => {
    if (captured) return;
    const interval = setInterval(() => {
      setGuidance((prev) => {
        if (prev === 'center') return 'hold';
        if (prev === 'hold') return 'good';
        return 'center';
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [captured]);

  // Lighting check
  useEffect(() => {
    if (!streamRef.current || captured) return;
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || !video.videoWidth) return;
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, 100, 100);
      const imageData = ctx.getImageData(0, 0, 100, 100);
      const pixels = imageData.data;
      let sum = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        sum += pixels[i] + pixels[i + 1] + pixels[i + 2];
      }
      const brightness = sum / (pixels.length / 4 * 3);
      setLightingOk(brightness > 50);
      // Show distance hint if brightness is very low
      setShowDistanceHint(brightness < 30);
    }, 1500);
    return () => clearInterval(interval);
  }, [captured]);

  const handleStartCamera = async () => {
    await startCamera();
  };

  const handleCapture = useCallback(() => {
    let count = 3;
    setCountdown(count);
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        setCountdown(null);
        const frame = captureFrame();
        if (frame) {
          setCaptured(frame);
          setCapturedImage(frame);
          setScleraRedness(Math.random() > 0.5);
          stopCamera();
        }
      } else {
        setCountdown(count);
      }
    }, 1000);
  }, [captureFrame, setCapturedImage, setScleraRedness, stopCamera]);

  const handleRetake = () => {
    setCaptured(null);
    setCameraError(null);
    setLightingOk(null);
    startCamera();
  };

  const handleContinue = () => {
    setStep('questionnaire');
    navigate('/questionnaire');
  };

  // Camera permission denied screen
  if (cameraError === 'camera_permission_denied' && !captured) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="glass-card p-8 rounded-xl">
          <svg className="w-16 h-16 mx-auto mb-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
          </svg>
          <h2 className="text-lg font-medium text-text-primary dark:text-white mb-3">{t('capture.camera_guide_title')}</h2>
          <ol className="text-sm text-neutral text-left mb-6 space-y-2 list-decimal list-inside">
            <li>{t('capture.camera_guide_step1')}</li>
            <li>{t('capture.camera_guide_step2')}</li>
            <li>{t('capture.camera_guide_step3')}</li>
          </ol>
          <Button onClick={() => navigate('/settings')} variant="outline">{t('common.back')}</Button>
        </div>
      </div>
    );
  }

  // Initial screen before camera starts
  if (!captured && !streamRef.current && !loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-lg font-medium text-text-primary dark:text-white mb-4">{t('capture.title')}</h1>
          <p className="text-sm text-neutral mb-8">{t('capture.guidance_center')}</p>
          <Button size="lg" onClick={handleStartCamera} aria-label="Open camera">
            Open Camera
          </Button>
        </motion.div>
      </div>
    );
  }

  // Camera live view
  if (!captured) {
    return (
      <div className="relative min-h-[calc(100vh-3.5rem)] bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Animated eye alignment guide */}
        <EyeAlignmentGuide guidance={guidance} lightingOk={lightingOk} eyeDetected={eyeDetected} />

        {/* Guidance text at top */}
        <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
          <motion.p
            key={guidance}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-white bg-black/40 inline-block px-4 py-1.5 rounded-pill backdrop-blur-sm"
          >
            {guidance === 'center' && t('capture.guidance_center')}
            {guidance === 'hold' && t('capture.guidance_hold')}
            {guidance === 'good' && t('capture.guidance_good')}
          </motion.p>
        </div>

        {/* Quality indicators */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
          <motion.span
            animate={{ opacity: lightingOk === null ? 0.6 : 1 }}
            className={`text-xs px-2.5 py-1 rounded-pill text-white backdrop-blur-sm ${
              lightingOk === null ? 'bg-neutral-500/50' :
              lightingOk ? 'bg-secondary/70' : 'bg-warning/70'
            }`}
          >
            {lightingOk === null ? '...' : lightingOk ? '✓' : '⚠'} {t('capture.quality_lighting')}
          </motion.span>
          <motion.span
            animate={{ opacity: eyeDetected ? 1 : 0.6 }}
            className={`text-xs px-2.5 py-1 rounded-pill text-white backdrop-blur-sm ${
              eyeDetected ? 'bg-secondary/70' : 'bg-neutral-500/50'
            }`}
          >
            {eyeDetected ? '✓' : '...'} {t('capture.quality_eye')}
          </motion.span>
        </div>

        {/* Distance hint */}
        {showDistanceHint && (
          <div className="absolute top-16 left-0 right-0 text-center pointer-events-none">
            <p className="text-xs text-warning bg-black/40 inline-block px-3 py-1 rounded-pill backdrop-blur-sm">
              Move closer or improve lighting
            </p>
          </div>
        )}

        {/* Capture button / countdown */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
          {countdown !== null ? (
            <motion.div
              key={countdown}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
            >
              <span className="text-2xl font-medium text-white">{countdown}</span>
            </motion.div>
          ) : (
            <button
              onClick={handleCapture}
              className="w-20 h-20 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg flex items-center justify-center cursor-pointer pointer-events-auto"
              aria-label="Capture iris photo"
            >
              <div className="w-14 h-14 rounded-full border-2 border-primary" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Captured image review
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6 rounded-xl text-center"
      >
        <div className="relative mb-6">
          <img src={captured} alt="Captured iris" className="w-full max-w-xs mx-auto rounded-card" />
          <svg viewBox="0 0 300 300" className="absolute inset-0 w-full max-w-xs mx-auto pointer-events-none" aria-hidden="true">
            <line x1="150" y1="0" x2="150" y2="300" stroke="rgba(26,111,212,0.3)" strokeWidth="0.5" />
            <line x1="0" y1="150" x2="300" y2="150" stroke="rgba(26,111,212,0.3)" strokeWidth="0.5" />
            <line x1="0" y1="0" x2="300" y2="300" stroke="rgba(26,111,212,0.3)" strokeWidth="0.5" />
            <line x1="300" y1="0" x2="0" y2="300" stroke="rgba(26,111,212,0.3)" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={handleRetake}>{t('capture.retake')}</Button>
          <Button onClick={handleContinue}>{t('capture.continue')}</Button>
        </div>
      </motion.div>
    </div>
  );
}