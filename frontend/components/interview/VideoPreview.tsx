'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, Mic, MicOff, CheckCircle2, AlertCircle, User, RefreshCw, Users, ShieldAlert } from 'lucide-react';

export type ProctoringAlert = 'NONE' | 'OUT_OF_FRAME' | 'MULTIPLE_PERSONS' | 'CAMERA_OFF';

export interface ProctoringStatus {
  alert: ProctoringAlert;
  facesDetected: number;
  isCentered: boolean;
  message: string;
}

export interface VideoPreviewProps {
  isMicActive: boolean;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onProctoringStatus?: (status: ProctoringStatus) => void;
  showVerificationGuide?: boolean;
}

// Fast lightweight face and skin-cluster analyzer across browsers
async function analyzeVideoFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
): Promise<{ faceCount: number; isCentered: boolean }> {
  // 1. Try Native Shape Detection API (Supported natively in Chromium / Chrome / Edge)
  if (typeof window !== 'undefined' && 'FaceDetector' in window) {
    try {
      const detector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 5 });
      const faces = await detector.detect(video);
      if (faces && Array.isArray(faces)) {
        const count = faces.length;
        if (count === 0) return { faceCount: 0, isCentered: false };
        if (count > 1) return { faceCount: count, isCentered: false };

        const face = faces[0].boundingBox;
        const vidW = video.videoWidth || 640;
        const vidH = video.videoHeight || 480;
        const centerX = face.x + face.width / 2;
        const centerY = face.y + face.height / 2;
        const isCentered =
          centerX > vidW * 0.22 &&
          centerX < vidW * 0.78 &&
          centerY > vidH * 0.12 &&
          centerY < vidH * 0.88;
        return { faceCount: 1, isCentered };
      }
    } catch {
      // Fallback to canvas
    }
  }

  // 2. Pure Canvas YCbCr Chromaticity & Density Cluster Analysis Fallback
  try {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { faceCount: 1, isCentered: true };

    const w = 120;
    const h = 90;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let totalSkin = 0;
    let leftSkin = 0;
    let centerSkin = 0;
    let rightSkin = 0;
    let sumX = 0;

    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // YCbCr transformation
        const Y = 0.299 * r + 0.587 * g + 0.114 * b;
        const Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        const Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

        // Human skin tone cluster
        if (Y > 38 && Y < 238 && Cb >= 77 && Cb <= 127 && Cr >= 133 && Cr <= 173) {
          totalSkin++;
          sumX += x;
          if (x < w * 0.32) {
            leftSkin++;
          } else if (x > w * 0.68) {
            rightSkin++;
          } else {
            centerSkin++;
          }
        }
      }
    }

    const totalSampled = (w / 2) * (h / 2); // 2700 pixels
    const skinRatio = totalSkin / totalSampled;

    // Below 3.5% skin cluster -> person is out of frame
    if (skinRatio < 0.035) {
      return { faceCount: 0, isCentered: false };
    }

    // Two distinct separated skin clusters with low center density -> multiple persons
    if (leftSkin > totalSkin * 0.35 && rightSkin > totalSkin * 0.35 && centerSkin < totalSkin * 0.22) {
      return { faceCount: 2, isCentered: false };
    }

    // Centering check
    const avgX = sumX / totalSkin;
    const isCentered = avgX >= w * 0.24 && avgX <= w * 0.76;

    return { faceCount: 1, isCentered };
  } catch {
    return { faceCount: 1, isCentered: true };
  }
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  isMicActive,
  isCameraActive,
  onToggleCamera,
  onToggleMic,
  onProctoringStatus,
  showVerificationGuide = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Proctoring Status
  const [proctoring, setProctoring] = useState<ProctoringStatus>({
    alert: 'NONE',
    facesDetected: 1,
    isCentered: true,
    message: 'Camera Standby'
  });

  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  const requestCamera = useCallback(async () => {
    stopTracks();
    setErrorMessage(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setPermissionStatus('denied');
      setErrorMessage('Camera access is not supported in this browser.');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user'
        },
        audio: false // Handled independently by Speech STT
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setPermissionStatus('granted');
    } catch (err: any) {
      console.warn('Camera request error:', err);
      setPermissionStatus('denied');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera permission was denied. Please allow camera access in your browser URL bar.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera device detected on your system.');
      } else {
        setErrorMessage('Unable to access camera hardware. It may be in use by another application.');
      }
    }
  }, [stopTracks]);

  // Manage camera lifecycle based on isCameraActive toggle
  useEffect(() => {
    if (isCameraActive) {
      requestCamera();
    } else {
      stopTracks();
      setPermissionStatus('idle');
    }

    return () => {
      stopTracks();
    };
  }, [isCameraActive, requestCamera, stopTracks]);

  // Bind media stream to video element
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.srcObject = stream;
      if (stream) {
        video.play().catch(e => console.warn('Video auto-play interrupted:', e));
      }
    }
  }, [stream]);

  const isLive = isCameraActive && permissionStatus === 'granted' && !!stream;

  // Real-time proctoring evaluation loop
  useEffect(() => {
    if (!isLive) {
      const offStatus: ProctoringStatus = {
        alert: isCameraActive ? 'NONE' : 'CAMERA_OFF',
        facesDetected: 0,
        isCentered: false,
        message: isCameraActive ? 'Initializing camera...' : 'Camera Off'
      };
      setProctoring(offStatus);
      onProctoringStatus?.(offStatus);
      return;
    }

    let isMounted = true;
    const interval = setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      const { faceCount, isCentered } = await analyzeVideoFrame(video, canvas);
      if (!isMounted) return;

      let nextStatus: ProctoringStatus;
      if (faceCount === 0) {
        nextStatus = {
          alert: 'OUT_OF_FRAME',
          facesDetected: 0,
          isCentered: false,
          message: 'No face detected. Candidate is out of frame.'
        };
      } else if (faceCount > 1) {
        nextStatus = {
          alert: 'MULTIPLE_PERSONS',
          facesDetected: faceCount,
          isCentered: false,
          message: `Multiple persons detected (${faceCount}) in camera frame!`
        };
      } else {
        nextStatus = {
          alert: 'NONE',
          facesDetected: 1,
          isCentered,
          message: isCentered ? 'Candidate verified & centered' : 'Candidate off-center'
        };
      }

      setProctoring(nextStatus);
      onProctoringStatus?.(nextStatus);
    }, 1200);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isLive, isCameraActive, onProctoringStatus]);

  return (
    <div className={`relative bg-[#060608] border rounded-2xl overflow-hidden aspect-video flex flex-col items-center justify-center shadow-lg transition-colors duration-300 ${
      proctoring.alert === 'OUT_OF_FRAME'
        ? 'border-red-500/80 shadow-red-500/20 ring-2 ring-red-500/40'
        : proctoring.alert === 'MULTIPLE_PERSONS'
        ? 'border-amber-500/80 shadow-amber-500/20 ring-2 ring-amber-500/40'
        : proctoring.alert === 'NONE' && isLive && proctoring.isCentered
        ? 'border-emerald-500/40'
        : 'border-white/[0.08]'
    }`}>
      {/* Offscreen Canvas for Frame Processing */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
          isLive ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
        }`}
      />

      {/* Fallback Display: Camera Muted or Permission Denied */}
      {!isLive && (
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 z-10 max-w-sm mx-auto">
          <div className={`w-16 h-16 rounded-full border flex items-center justify-center transition-colors ${
            permissionStatus === 'denied'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-[#0E0E14] border-white/10 text-neutral-400'
          }`}>
            {permissionStatus === 'denied' ? (
              <AlertCircle className="w-8 h-8 text-red-400" />
            ) : (
              <User className="w-8 h-8 text-purple-400/80" />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-neutral-200">
              {permissionStatus === 'denied' ? 'Camera Access Blocked' : 'Camera Off'}
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {errorMessage || (isCameraActive ? 'Initializing camera feed...' : 'Your camera is currently muted.')}
            </p>
          </div>

          {permissionStatus === 'denied' && (
            <button
              type="button"
              onClick={requestCamera}
              className="mt-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white flex items-center gap-1.5 transition border border-white/10 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry Camera</span>
            </button>
          )}
        </div>
      )}

      {/* Interactive Face Alignment Guide (Active when live) */}
      {isLive && showVerificationGuide && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
          <div className={`w-44 h-56 rounded-full border-2 border-dashed transition-all duration-300 ${
            proctoring.alert === 'OUT_OF_FRAME'
              ? 'border-red-500 shadow-lg shadow-red-500/30 animate-pulse'
              : proctoring.alert === 'MULTIPLE_PERSONS'
              ? 'border-amber-400 shadow-lg shadow-amber-400/30 animate-pulse'
              : proctoring.isCentered
              ? 'border-emerald-400/80 shadow-sm shadow-emerald-400/20'
              : 'border-white/30'
          }`} />
        </div>
      )}

      {/* Top Telemetry & Proctoring Status Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-xs">
          <span className={`w-2 h-2 rounded-full ${
            !isLive
              ? 'bg-neutral-500'
              : proctoring.alert === 'OUT_OF_FRAME'
              ? 'bg-red-500 animate-ping'
              : proctoring.alert === 'MULTIPLE_PERSONS'
              ? 'bg-amber-400 animate-pulse'
              : 'bg-emerald-400 animate-pulse'
          }`} />
          <span className="text-neutral-200 font-medium text-[11px]">
            {isLive ? 'Live Proctoring' : isCameraActive ? 'Connecting...' : 'Camera Off'}
          </span>
        </div>

        {isLive && (
          <div className={`flex items-center gap-1.5 backdrop-blur-md px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all ${
            proctoring.alert === 'OUT_OF_FRAME'
              ? 'bg-red-500/25 border-red-500 text-red-300 animate-pulse'
              : proctoring.alert === 'MULTIPLE_PERSONS'
              ? 'bg-amber-500/25 border-amber-500 text-amber-300 animate-pulse'
              : proctoring.isCentered
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-white/10 border-white/15 text-neutral-300'
          }`}>
            {proctoring.alert === 'OUT_OF_FRAME' ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>Out of Frame</span>
              </>
            ) : proctoring.alert === 'MULTIPLE_PERSONS' ? (
              <>
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Multiple People Detected ({proctoring.facesDetected})</span>
              </>
            ) : proctoring.isCentered ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Candidate Centered</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Please Center Face</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom control bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-3 z-20">
        <button
          onClick={onToggleMic}
          type="button"
          className={`p-2.5 rounded-full border transition-all cursor-pointer ${
            isMicActive
              ? 'bg-[#0E0E14]/90 border-white/10 text-white hover:bg-white/10 shadow-sm'
              : 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
          }`}
          title={isMicActive ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        <button
          onClick={onToggleCamera}
          type="button"
          className={`p-2.5 rounded-full border transition-all cursor-pointer ${
            isCameraActive
              ? 'bg-[#0E0E14]/90 border-white/10 text-white hover:bg-white/10 shadow-sm'
              : 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
          }`}
          title={isCameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          {isCameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

