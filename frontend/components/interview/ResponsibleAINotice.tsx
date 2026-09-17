'use client';

import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface ResponsibleAINoticeProps {
  compact?: boolean;
}

export const ResponsibleAINotice: React.FC<ResponsibleAINoticeProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400 bg-navy-900/60 border border-navy-700/80 rounded-lg px-3 py-2">
        <ShieldCheck className="w-4 h-4 text-brand-cyan shrink-0" />
        <span>
          Visual analysis is strictly limited to interaction-related signals and does <strong>not</strong> assess personality, emotions, honesty, or mental state.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-4 flex items-start gap-3 text-sm text-slate-300">
      <div className="p-2 bg-brand-blue/10 border border-brand-blue/20 rounded-lg text-brand-cyan shrink-0 mt-0.5">
        <ShieldCheck className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <h4 className="font-semibold text-slate-100 flex items-center gap-2">
          Responsible AI & Evaluation Notice
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          PlacePrep uses Microsoft Azure AI technologies for interview simulation and curriculum roadmapping. All scores and recommendations are AI-generated practice estimates. Visual processing measures solely operational interaction signals (framing and presence) and strictly rejects assessments of personality, emotions, honesty, or mental state.
        </p>
      </div>
    </div>
  );
};
