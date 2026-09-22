'use client';

import React, { useEffect, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface AudioVisualizerProps {
  isRecording: boolean;
  statusText?: string;
  isMicActive?: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isRecording,
  statusText = 'Microphone Standby',
  isMicActive = true
}) => {
  const BAR_COUNT = 14;
  const [barHeights, setBarHeights] = useState<number[]>(() => Array(BAR_COUNT).fill(6));

  useEffect(() => {
    if (!isRecording || !isMicActive) {
      setBarHeights(Array(BAR_COUNT).fill(6));
      return;
    }

    // Dynamic wave animation responsive to active recording
    const interval = setInterval(() => {
      setBarHeights(() =>
        Array.from({ length: BAR_COUNT }, (_, i) => {
          const base = 8;
          const variance = Math.sin(Date.now() / 200 + i) * 12 + Math.random() * 18;
          return Math.max(6, Math.min(38, Math.round(base + variance)));
        })
      );
    }, 90);

    return () => clearInterval(interval);
  }, [isRecording, isMicActive, BAR_COUNT]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#0B0B0F] border border-white/[0.08] rounded-xl space-y-3 shadow-md">
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          {isRecording && isMicActive && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${
            !isMicActive
              ? 'bg-neutral-600'
              : isRecording
              ? 'bg-red-500'
              : 'bg-neutral-500'
          }`}></span>
        </span>
        <span className="text-xs font-medium tracking-wide uppercase text-neutral-300">
          {!isMicActive ? 'Microphone Muted' : statusText}
        </span>
      </div>

      {/* Real-time Frequency Waveform Bars */}
      <div className="flex items-end justify-center gap-1.5 h-12 w-full max-w-xs px-2">
        {barHeights.map((height, idx) => (
          <div
            key={idx}
            className={`w-1.5 rounded-full transition-all duration-75 ${
              isRecording && isMicActive
                ? 'bg-gradient-to-t from-purple-500 via-indigo-500 to-pink-500 shadow-sm shadow-purple-500/30'
                : 'bg-white/10'
            }`}
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
    </div>
  );
};
