'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  const azureTechnologies = [
    { name: 'Microsoft Foundry', role: 'Model Orchestration' },
    { name: 'Azure AI Search', role: 'Knowledge Grounding' },
    { name: 'AI Agents', role: 'Interview Evaluation' },
    { name: 'Azure AI Speech', role: 'Voice Transcription' },
    { name: 'Azure AI Vision', role: 'Interaction Signals' },
    { name: 'RAG', role: 'Placement Grounding' },
  ];

  return (
    <footer className="w-full bg-black border-t border-white/[0.07] pt-12 pb-8 text-neutral-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Azure Technology Badges Section */}
        <div className="bg-[#0B0B0F]/90 border border-white/[0.08] rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-neutral-200">
                Powered by Microsoft Azure AI Architecture
              </span>
            </div>
            <span className="text-xs text-neutral-400">
              College AI Capstone Architecture &bull; Development Mock Mode Enabled
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {azureTechnologies.map(tech => (
              <div
                key={tech.name}
                className="bg-[#060608]/80 border border-white/[0.07] rounded-xl p-3 text-center transition-all hover:border-purple-500/40"
              >
                <div className="text-xs font-semibold text-neutral-100">{tech.name}</div>
                <div className="text-[11px] text-purple-400/90 mt-0.5">{tech.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Links & Branding */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                PlacePrep
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-glow-purple inline-block ml-0.5 animate-pulse" />
              </span>
            </Link>
            <span className="text-xs text-neutral-400 border-l border-white/10 pl-3">
              AI-powered campus placement preparation assistant.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-neutral-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/chat" className="hover:text-white transition-colors">AI Chat</Link>
            <Link href="/interview" className="hover:text-white transition-colors">Mock Interview</Link>
            <Link href="/roadmap" className="hover:text-white transition-colors">Roadmap</Link>
            <Link href="/profile" className="hover:text-white transition-colors">Student Profile</Link>
          </div>
        </div>

        {/* Responsible AI Disclaimer */}
        <div className="pt-6 border-t border-white/[0.08] text-center text-xs text-neutral-400 max-w-3xl mx-auto leading-relaxed">
          PlacePrep is an academic AI preparation platform. All interview scores and curriculum roadmaps are AI-generated practice estimates. Visual analysis is restricted to presence/framing telemetry and does not assess personality, emotions, honesty, or mental state.
        </div>
      </div>
    </footer>
  );
};
