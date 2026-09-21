'use client';

import React, { useEffect, useState } from 'react';
import { Mic, Radio } from 'lucide-react';

interface AudioVisualizerProps {
  isRecording: boolean;
  statusText?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isRecording, statusText = 'Listening...' }) => {
  const [barHeights, setBarHeights] = useState<number[]>([12, 24, 18, 32, 20, 28, 14, 22, 36, 16, 26, 12]);

  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setBarHeights(prev =>
        prev.map(() => Math.floor(Math.random() * 32) + 8)
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#0B0B0F] border border-white/[0.08] rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          {isRecording && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isRecording ? 'bg-red-500' : 'bg-neutral-500'}`}></span>
        </span>
        <span className="text-xs font-medium tracking-wide uppercase text-neutral-300">
          {statusText}
        </span>
      </div>

      {/* Waveform Bars */}
      <div className="flex items-end justify-center gap-1.5 h-12 w-full max-w-xs px-2">
        {barHeights.map((height, idx) => (
          <div
            key={idx}
            className={`w-1.5 rounded-full transition-all duration-100 ${
              isRecording
                ? 'bg-gradient-to-t from-purple-500 to-pink-500 shadow-sm shadow-purple-500/30'
                : 'bg-white/10 h-2'
            }`}
            style={{ height: isRecording ? `${height}px` : '6px' }}
          />
        ))}
      </div>
    </div>
  );
};
