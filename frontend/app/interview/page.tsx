'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../../components/layout/Sidebar';
import {
  Video,
  Mic,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { api } from '../../lib/api';
import { DifficultyLevel, InterviewType } from '../../types';
import { ResponsibleAINotice } from '../../components/interview/ResponsibleAINotice';

export default function InterviewSetupPage() {
  const router = useRouter();

  const [role, setRole] = useState('Software Developer');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Intermediate');
  const [type, setType] = useState<InterviewType>('Technical');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles = [
    'Software Developer',
    'Java Developer',
    'Python Developer',
    'Data Analyst',
    'Web Developer'
  ];

  const difficulties: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
  const interviewTypes: InterviewType[] = ['Technical', 'HR', 'Mixed'];
  const countOptions = [5, 10, 15];

  const handleStartInterview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const startRes = await api.startInterview({
        role,
        difficulty,
        type,
        questions: questionCount
      });

      // Save initial session state in sessionStorage for live session page
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('active_interview_session', JSON.stringify(startRes));
      }

      router.push(`/interview/session?sessionId=${startRes.sessionId}`);
    } catch (err: any) {
      console.error('Interview start error:', err);
      setError(err.message || 'Something went wrong while initializing the interview. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex bg-navy-950">
      <Sidebar />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 overflow-y-auto">
        {/* Heading */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-900 border border-navy-700 text-xs font-semibold text-brand-cyan mb-2">
            <Video className="w-3.5 h-3.5" />
            <span>AI Speech &amp; Vision Simulation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Mock Interview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Practice under realistic interview conditions and receive AI-powered feedback.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Configuration Card */}
        <div className="card-surface p-6 sm:p-8 space-y-8">
          {/* Field 1: Target Role */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Target Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {roles.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                    role === r
                      ? 'bg-brand-blue/20 border-brand-blue text-white shadow-sm'
                      : 'bg-navy-900 border-navy-700/80 text-slate-300 hover:text-white hover:bg-navy-850'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Field 2: Difficulty */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {difficulties.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`p-3.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                    difficulty === d
                      ? 'bg-brand-blue/20 border-brand-blue text-white shadow-sm'
                      : 'bg-navy-900 border-navy-700/80 text-slate-300 hover:text-white hover:bg-navy-850'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Field 3: Interview Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Interview Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {interviewTypes.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`p-3.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                    type === t
                      ? 'bg-brand-blue/20 border-brand-blue text-white shadow-sm'
                      : 'bg-navy-900 border-navy-700/80 text-slate-300 hover:text-white hover:bg-navy-850'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Field 4: Number of Questions */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Number of Questions
            </label>
            <div className="grid grid-cols-3 gap-3">
              {countOptions.map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`p-3.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                    questionCount === cnt
                      ? 'bg-brand-blue/20 border-brand-blue text-white shadow-sm'
                      : 'bg-navy-900 border-navy-700/80 text-slate-300 hover:text-white hover:bg-navy-850'
                  }`}
                >
                  {cnt} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Information Panel */}
          <div className="p-4 bg-navy-900/90 border border-navy-700 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-cyan" />
              <span>Interview Architecture Capabilities</span>
            </h4>
            <ul className="text-xs text-slate-400 space-y-1 pl-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                <span><strong>AI Speech:</strong> Real-time answer transcription and speech fidelity.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                <span><strong>AI Vision:</strong> Visual interaction signals (candidate presence &amp; camera framing).</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                <span><strong>AI Evaluation:</strong> In-depth technical rubric scoring and personalized strengths breakdown.</span>
              </li>
            </ul>
          </div>

          {/* Responsible AI Notice */}
          <ResponsibleAINotice />

          {/* Start Action Button */}
          <button
            onClick={handleStartInterview}
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-brand-blue text-white font-bold text-sm shadow-lg shadow-brand-blue/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Initializing Live Session...</span>
            ) : (
              <>
                <span>Start Interview</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
