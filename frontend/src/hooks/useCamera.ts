import { useState, useRef, useCallback, useEffect } from 'react';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  error: string | null;
  loading: boolean;
  started: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureFrame: () => string | null;
  lighting: 'good' | 'poor' | 'unknown';
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [lighting, setLighting] = useState<'good' | 'poor' | 'unknown'>('unknown');
  const lightingIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setLoading(false);
      setStarted(true);
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('camera_permission_denied');
      } else {
        setError('generic');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (lightingIntervalRef.current) {
      window.clearInterval(lightingIntervalRef.current);
      lightingIntervalRef.current = null;
    }
    const currentStream = streamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStarted(false);
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
    const currentStream = streamRef.current;
    if (!currentStream || !videoRef.current) return;

    const video = videoRef.current;
    lightingIntervalRef.current = window.setInterval(() => {
      if (!video.videoWidth || !video.videoHeight) return;
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
        sum += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
      }
      const avgBrightness = sum / (pixels.length / 4);
      setLighting(avgBrightness > 60 ? 'good' : 'poor');
    }, 1000);

    return () => {
      if (lightingIntervalRef.current) {
        window.clearInterval(lightingIntervalRef.current);
        lightingIntervalRef.current = null;
      }
    };
  }, [stream]);

  useEffect(() => {
    const currentStream = streamRef.current;
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return { videoRef, stream, error, loading, started, startCamera, stopCamera, captureFrame, lighting };
}