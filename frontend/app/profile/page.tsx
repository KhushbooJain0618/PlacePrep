'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../components/layout/Sidebar';
import {
  User,
  Mail,
  Briefcase,
  Calendar,
  Award,
  Shield,
  Save,
  CheckCircle2,
  Cpu,
  Sparkles,
  Video,
  TrendingUp,
  ArrowRight,
  Clock,
  Layers,
  Map
} from 'lucide-react';
import { api, authStorage } from '../../lib/api';
import { InterviewFinishResponse, RoadmapGenerateResponse } from '../../types';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [collegeYear, setCollegeYear] = useState('');
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [interviews, setInterviews] = useState<InterviewFinishResponse[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<RoadmapGenerateResponse | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    // Initialize from cached user
    const cached = authStorage.getUser();
    if (cached) {
      if (cached.name) setName(cached.name);
      if (cached.email) setEmail(cached.email);
      if (cached.targetRole) setTargetRole(cached.targetRole);
      if (cached.collegeYear) setCollegeYear(cached.collegeYear);
    }

    // Refresh from backend if token present
    api.getMe().then(res => {
      if (res.user) {
        if (res.user.name) setName(res.user.name);
        if (res.user.email) setEmail(res.user.email);
        if (res.user.targetRole) setTargetRole(res.user.targetRole);
        if (res.user.collegeYear) setCollegeYear(res.user.collegeYear);
      }
    }).catch(() => {
      // Offline / unauthenticated fallback
    });

    // Extract real student interview and roadmap history from backend
    Promise.all([
      api.getInterviewHistory().then(res => res.interviews || []).catch(() => []),
      api.getLatestRoadmap().then(res => res.roadmap).catch(() => null)
    ]).then(([interviewData, roadmapData]) => {
      setInterviews(interviewData);
      setActiveRoadmap(roadmapData);
      setLoadingHistory(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateProfile({ name, targetRole, collegeYear });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Update profile error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ST';

  return (
    <div className="flex-1 flex bg-black min-h-[calc(100vh-4rem)] relative overflow-hidden">
      <Sidebar />

      {/* Ambient background glow */}
      <div className="ambient-center-glow opacity-30 pointer-events-none" />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 overflow-y-auto relative z-10">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-semibold text-purple-300 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Account &amp; Preferences</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Student Profile
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your personal placement target role and preparation preferences.
          </p>
        </div>

        {/* Profile Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#09090E]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-white/[0.08]">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-200 text-xl font-bold shadow-lg shadow-purple-500/20">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{name || 'Student Profile'}</h2>
              <p className="text-xs text-purple-400 font-semibold">{targetRole ? `${targetRole} Aspirant` : 'Placement Aspirant'}</p>
              <p className="text-xs text-slate-400 mt-0.5">{email || 'No email registered'}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06060A] border border-white/[0.08] text-slate-100 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  College Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06060A] border border-white/[0.08] text-slate-100 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Target Role
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Software Developer"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06060A] border border-white/[0.08] text-slate-100 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Academic Year
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={collegeYear}
                    onChange={(e) => setCollegeYear(e.target.value)}
                    placeholder="e.g. Final Year (Class of 2026)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06060A] border border-white/[0.08] text-slate-100 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              {saved ? (
                <span className="text-xs text-purple-400 flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>Profile preferences updated successfully</span>
                </span>
              ) : <div />}

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs shadow-xl shadow-purple-500/10 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Performance Statistics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#09090E]/90 border border-white/[0.08]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Interviews</span>
            <p className="text-2xl font-bold text-white mt-1">{interviews.length}</p>
            <span className="text-[10px] text-purple-400 mt-0.5 block">Completed Rounds</span>
          </div>

          <div className="p-4 rounded-xl bg-[#09090E]/90 border border-white/[0.08]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Avg Score</span>
            <p className="text-2xl font-bold text-white mt-1">
              {interviews.length > 0
                ? `${Math.round(interviews.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / interviews.length)}%`
                : '—'}
            </p>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">Technical &amp; HR</span>
          </div>

          <div className="p-4 rounded-xl bg-[#09090E]/90 border border-white/[0.08]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Highest Score</span>
            <p className="text-2xl font-bold text-white mt-1">
              {interviews.length > 0 ? `${Math.max(...interviews.map(i => i.overallScore || 0))}%` : '—'}
            </p>
            <span className="text-[10px] text-cyan-400 mt-0.5 block">Peak Evaluation</span>
          </div>

          <div className="p-4 rounded-xl bg-[#09090E]/90 border border-white/[0.08]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Roadmap</span>
            <p className="text-2xl font-bold text-white mt-1">
              {activeRoadmap ? `${activeRoadmap.durationDays}d` : 'None'}
            </p>
            <span className="text-[10px] text-amber-400 mt-0.5 block">
              {activeRoadmap ? `${activeRoadmap.progressPercentage || 0}% Done` : 'Not Started'}
            </span>
          </div>
        </div>

        {/* Mock Interview History Section */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#09090E]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-400" />
                <h3 className="text-base font-bold text-white">Mock Interview History</h3>
                {interviews.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {interviews.length} Recorded
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Past AI evaluation sessions, rubrics, and bar raiser feedback saved in your account.
              </p>
            </div>

            <Link
              href="/interview"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Video className="w-3 h-3 text-purple-400" />
              <span>Practice New Round</span>
            </Link>
          </div>

          {loadingHistory ? (
            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading interview history from backend...</span>
            </div>
          ) : interviews.length === 0 ? (
            <div className="py-8 px-4 rounded-xl bg-[#06060A] border border-white/[0.05] text-center space-y-2">
              <Award className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-white">No Mock Interviews Recorded Yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Complete your first AI mock interview session with speech, vision, and technical evaluation to see your history here.
              </p>
              <div className="pt-2">
                <Link
                  href="/interview"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition inline-flex items-center gap-1.5"
                >
                  <span>Start Mock Interview</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06] rounded-xl bg-[#06060A] border border-white/[0.06] overflow-hidden">
              {interviews.map(session => (
                <div
                  key={session.id || session.sessionId}
                  className="p-4 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center shrink-0 ${
                      session.overallScore >= 80
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : session.overallScore >= 60
                        ? 'text-purple-300 bg-purple-500/10 border-purple-500/20'
                        : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    }`}>
                      <span className="text-base font-extrabold leading-none">{session.overallScore}</span>
                      <span className="text-[8px] uppercase font-bold tracking-wider mt-0.5">Score</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white">{session.role}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-neutral-300">
                          {session.difficulty}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(session.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>Technical: <strong className="text-slate-200">{session.technical}%</strong></span>
                        <span>&bull;</span>
                        <span>Relevance: <strong className="text-slate-200">{session.relevance}%</strong></span>
                        <span>&bull;</span>
                        <span>Communication: <strong className="text-slate-200">{session.communication}%</strong></span>
                      </div>
                      {session.strengths && session.strengths.length > 0 && (
                        <p className="text-[11px] text-purple-300/80 line-clamp-1 italic">
                          Key Strength: &ldquo;{session.strengths[0]}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/interview/result?sessionId=${session.sessionId}`}
                    className="self-start md:self-auto px-3.5 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold border border-white/10 transition inline-flex items-center gap-1.5 shrink-0"
                  >
                    <span>View Report</span>
                    <ArrowRight className="w-3 h-3 text-purple-400" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Preparation Roadmap Card */}
        {activeRoadmap && (
          <div className="p-6 rounded-2xl bg-[#09090E]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold text-white">Active Preparation Roadmap</h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {activeRoadmap.durationDays} Days Plan
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Target Role: <strong className="text-slate-200">{activeRoadmap.targetRole}</strong> ({activeRoadmap.level} level) &bull; {activeRoadmap.dailyHours}h daily effort
              </p>
            </div>

            <Link
              href="/roadmap/view"
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition inline-flex items-center gap-1.5 shrink-0"
            >
              <span>Continue Syllabus</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
