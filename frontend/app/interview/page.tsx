'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  HelpCircle,
  Clock,
  Award
} from 'lucide-react';
import { api } from '../../lib/api';
import { DifficultyLevel, InterviewType, InterviewFinishResponse } from '../../types';
import { ResponsibleAINotice } from '../../components/interview/ResponsibleAINotice';

export default function InterviewSetupPage() {
  const router = useRouter();

  const [role, setRole] = useState('Software Developer');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Intermediate');
  const [type, setType] = useState<InterviewType>('Technical');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pastInterviews, setPastInterviews] = useState<InterviewFinishResponse[]>([]);

  useEffect(() => {
    api.getInterviewHistory().then(res => {
      if (res.interviews) {
        setPastInterviews(res.interviews);
      }
    }).catch(() => {});
  }, []);

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
    <div className="flex-1 flex bg-black relative">
      <div className="ambient-purple-glow" />
      <Sidebar />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 overflow-y-auto relative z-10">
        {/* Heading */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-purple-300 mb-2">
            <Video className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Speech &amp; Vision Simulation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Mock Interview
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Practice under realistic interview conditions and receive AI-powered feedback.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Configuration Card */}
        <div className="card-surface p-6 sm:p-8 space-y-8 bg-[#09090E]/90 border border-white/[0.08] rounded-2xl shadow-xl">
          {/* Field 1: Target Role */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-3">
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
                      ? 'bg-purple-500/20 border-purple-500 text-white shadow-sm'
                      : 'bg-[#0E0E14] border-white/10 text-neutral-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Field 2: Difficulty */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-3">
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
                      ? 'bg-purple-500/20 border-purple-500 text-white shadow-sm'
                      : 'bg-[#0E0E14] border-white/10 text-neutral-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Field 3: Interview Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-3">
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
                      ? 'bg-purple-500/20 border-purple-500 text-white shadow-sm'
                      : 'bg-[#0E0E14] border-white/10 text-neutral-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Field 4: Number of Questions */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-3">
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
                      ? 'bg-purple-500/20 border-purple-500 text-white shadow-sm'
                      : 'bg-[#0E0E14] border-white/10 text-neutral-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {cnt} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Information Panel */}
          <div className="p-4 bg-[#0E0E14] border border-white/[0.07] rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Interview Architecture Capabilities</span>
            </h4>
            <ul className="text-xs text-neutral-400 space-y-1 pl-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span><strong>AI Speech:</strong> Real-time answer transcription and speech fidelity.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span><strong>AI Vision:</strong> Visual interaction signals (candidate presence &amp; camera framing).</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
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
            className="w-full py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
          >
            {isLoading ? (
              <span>Initializing Live Session...</span>
            ) : (
              <>
                <span>Start Interview</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </div>

        {/* Past Mock Interview Records */}
        {pastInterviews.length > 0 && (
          <div className="card-surface p-6 sm:p-8 space-y-4 bg-[#09090E]/90 border border-white/[0.08] rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <h3 className="text-base font-bold text-white">Your Past Interview Sessions</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {pastInterviews.length} Completed
                </span>
              </div>
              <Link href="/profile" className="text-xs text-purple-400 hover:underline font-semibold">
                View All in Profile
              </Link>
            </div>

            <div className="divide-y divide-white/[0.06] rounded-xl bg-[#06060A] border border-white/[0.06] overflow-hidden">
              {pastInterviews.slice(0, 3).map((session) => (
                <div
                  key={session.id || session.sessionId}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                      session.overallScore >= 75
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-purple-300 bg-purple-500/10 border-purple-500/20'
                    }`}>
                      {session.overallScore}%
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-white">{session.role}</span>
                      <span className="text-[11px] text-neutral-400 ml-2">({session.difficulty})</span>
                      <span className="text-[11px] text-neutral-500 ml-2">
                        &bull; {new Date(session.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/interview/result?sessionId=${session.sessionId}`}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-semibold border border-white/10 transition inline-flex items-center gap-1.5"
                  >
                    <span>Review Report</span>
                    <ArrowRight className="w-3 h-3 text-purple-400" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
