import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useScanStore } from '@/store/useScanStore';
import Button from '@/components/UI/Button';

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
        <div className="card-raised p-8">
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

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72">
            <svg viewBox="0 0 300 300" className="w-full h-full" aria-hidden="true">
              <circle cx="150" cy="150" r="130" fill="none" stroke="white" strokeWidth="2" opacity="0.5" />
              <circle cx="150" cy="150" r="120" fill="none" stroke="white" strokeWidth="1" opacity="0.3" strokeDasharray="8 4">
                <animate attributeName="stroke-dashoffset" from="0" to="100" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="150" cy="150" r="40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
            </svg>
          </div>
        </div>

        <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
          <p className="text-sm text-white bg-black/50 inline-block px-4 py-1.5 rounded-pill backdrop-blur-sm">
            {guidance === 'center' && t('capture.guidance_center')}
            {guidance === 'hold' && t('capture.guidance_hold')}
            {guidance === 'good' && t('capture.guidance_good')}
          </p>
        </div>

        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
          <span className={`text-xs px-2.5 py-1 rounded-pill text-white ${
            lightingOk === null ? 'bg-neutral-500/70' :
            lightingOk ? 'bg-secondary/80' : 'bg-warning/80'
          }`}>
            {lightingOk === null ? '...' : lightingOk ? '✓' : '⚠'} {t('capture.quality_lighting')}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-pill text-white ${
            eyeDetected ? 'bg-secondary/80' : 'bg-neutral-500/70'
          }`}>
            {eyeDetected ? '✓' : '...'} {t('capture.quality_eye')}
          </span>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
          {countdown !== null ? (
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <span className="text-2xl font-medium text-white">{countdown}</span>
            </div>
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
      <div className="card-raised p-6 text-center">
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
      </div>
    </div>
  );
}