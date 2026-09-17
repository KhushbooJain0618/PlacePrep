'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Mic, MicOff, CheckCircle2, AlertCircle, User } from 'lucide-react';

interface VideoPreviewProps {
  isMicActive: boolean;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  isMicActive,
  isCameraActive,
  onToggleCamera,
  onToggleMic
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    let localStream: MediaStream | null = null;

    async function initCamera() {
      if (isCameraActive) {
        try {
          localStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: false
          });
          setStream(localStream);
          setHasPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = localStream;
          }
        } catch (err) {
          console.warn('Camera access not granted or not available, using simulated visual feed:', err);
          setHasPermission(false);
        }
      } else {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      }
    }

    initCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive]);

  return (
    <div className="relative bg-navy-950 border border-navy-700/80 rounded-2xl overflow-hidden aspect-video flex flex-col items-center justify-center shadow-lg">
      {/* Live Video or Simulated Feed */}
      {isCameraActive && hasPermission ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform -scale-x-100"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
          <div className="w-20 h-20 rounded-full bg-navy-900 border border-navy-700 flex items-center justify-center text-slate-400">
            <User className="w-10 h-10 text-brand-cyan/80" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">Candidate Video Feed</p>
            <p className="text-xs text-slate-400">
              {isCameraActive ? 'Camera active (simulated preview)' : 'Camera is muted'}
            </p>
          </div>
        </div>
      )}

      {/* Top telemetry status bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-navy-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-navy-700/80 text-xs">
          <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className="text-slate-200 font-medium">
            {isCameraActive ? 'Candidate Feed' : 'Camera Off'}
          </span>
        </div>

        {isCameraActive && (
          <div className="flex items-center gap-1.5 bg-navy-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-navy-700/80 text-[11px] text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Framing: Centered</span>
          </div>
        )}
      </div>

      {/* Bottom control bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-3">
        <button
          onClick={onToggleMic}
          type="button"
          className={`p-2.5 rounded-full border transition-all ${
            isMicActive
              ? 'bg-navy-900/90 border-navy-600 text-slate-100 hover:bg-navy-800'
              : 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
          }`}
          title={isMicActive ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        <button
          onClick={onToggleCamera}
          type="button"
          className={`p-2.5 rounded-full border transition-all ${
            isCameraActive
              ? 'bg-navy-900/90 border-navy-600 text-slate-100 hover:bg-navy-800'
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
