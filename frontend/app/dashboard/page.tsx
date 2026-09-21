'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../components/layout/Sidebar';
import {
  MessageSquare,
  Video,
  Map,
  ArrowRight,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  Layers,
  Sparkles,
  ChevronRight,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { authStorage, api } from '../../lib/api';

export default function DashboardPage() {
  const [studentName, setStudentName] = useState('Student');
  const [azureStatus, setAzureStatus] = useState<any>(null);
  const [isRefreshingAzure, setIsRefreshingAzure] = useState(false);

  const loadAzureStatus = async () => {
    try {
      setIsRefreshingAzure(true);
      const data = await api.getAzureDiagnostics();
      setAzureStatus(data);
    } catch {
      // ignore
    } finally {
      setIsRefreshingAzure(false);
    }
  };

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);

  useEffect(() => {
    const user = authStorage.getUser();
    if (user) {
      setCurrentUser(user);
      if (user.name) setStudentName(user.name.split(' ')[0]);
    }
    api.getMe().then(res => {
      if (res.user) {
        setCurrentUser(res.user);
        if (res.user.name) setStudentName(res.user.name.split(' ')[0]);
      }
    }).catch(() => {});

    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('active_placement_roadmap');
      if (stored) {
        try {
          setActiveRoadmap(JSON.parse(stored));
        } catch {}
      }
    }
    loadAzureStatus();
  }, []);

  const todayFocusItems = [
    {
      subject: 'DSA',
      topic: 'Arrays & Two Pointers',
      detail: 'Solve key foundational problems: Maximum Subarray, 2Sum, and Two Pointers',
      duration: '45 mins',
      completed: false,
      icon: Code2,
      color: 'text-brand-blue-light'
    },
    {
      subject: 'OOP',
      topic: 'Inheritance & Polymorphism',
      detail: 'Review virtual methods, dynamic dispatch, and interface vs abstract class',
      duration: '30 mins',
      completed: false,
      icon: Layers,
      color: 'text-brand-cyan'
    },
    {
      subject: 'SQL',
      topic: 'Joins & Aggregation Queries',
      detail: 'Practice writing queries with INNER, LEFT, and aggregate GROUP BY filters',
      duration: '30 mins',
      completed: false,
      icon: Database,
      color: 'text-amber-400'
    }
  ];

  return (
    <div className="flex-1 flex bg-black min-h-[calc(100vh-4rem)] relative">
      {/* Subtle ambient purple glow */}
      <div className="ambient-purple-glow" />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Dashboard Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto relative z-10">
        {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Good morning, {studentName} <span className="inline-block animate-wave origin-bottom-right">👋</span>
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Let&apos;s make progress toward your placement goal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-semibold text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Campus Hiring Sprint 2026</span>
            </span>
            <Link
              href="/interview"
              className="bg-white text-black font-semibold text-xs px-4 py-2 rounded-lg hover:bg-neutral-200 transition shadow-sm inline-flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5 text-black" />
              <span>New Mock Session</span>
            </Link>
          </div>
        </div>

        {/* Hero / Summary Card: Your Placement Journey */}
        <div className="card-surface p-6 sm:p-8 bg-[#09090E]/90 border border-white/[0.08] rounded-2xl relative overflow-hidden shadow-xl">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                  Overview
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  Your Placement Journey
                </h2>
              </div>
              <span className="text-xs text-neutral-400 bg-black/60 px-3.5 py-1.5 rounded-full border border-white/10">
                {activeRoadmap ? `Placement Window: Day 1 of ${activeRoadmap.durationDays}` : 'Placement Sprint: Active'}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="bg-[#0E0E14] border border-white/[0.07] p-4 rounded-xl">
                <span className="text-xs text-neutral-400 font-medium">Readiness Score</span>
                <p className="text-2xl font-bold text-white mt-1">{currentUser?.preparationProgress ?? 0}%</p>
                <span className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3 h-3" /> Real-time tracking
                </span>
              </div>

              <div className="bg-[#0E0E14] border border-white/[0.07] p-4 rounded-xl">
                <span className="text-xs text-neutral-400 font-medium">Mock Interviews</span>
                <p className="text-2xl font-bold text-white mt-1">{currentUser?.interviewsCompleted ?? 0} Completed</p>
                <span className="text-[11px] text-purple-400 mt-1 font-medium block">
                  Speech & Vision active
                </span>
              </div>

              <div className="bg-[#0E0E14] border border-white/[0.07] p-4 rounded-xl">
                <span className="text-xs text-neutral-400 font-medium">Topics Mastered</span>
                <p className="text-2xl font-bold text-white mt-1">{currentUser?.topicsCovered ?? 0} Topics</p>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  DSA, DBMS & Core CS
                </span>
              </div>

              <div className="bg-[#0E0E14] border border-white/[0.07] p-4 rounded-xl">
                <span className="text-xs text-neutral-400 font-medium">Daily Streak</span>
                <p className="text-2xl font-bold text-white mt-1">{currentUser?.dailyStreak ?? 0} Days</p>
                <span className="text-[11px] text-brand-cyan mt-1 font-medium block">
                  Consistent preparation
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AZURE AI CLOUD INTEGRATION STATUS */}
        <div className="bg-[#09090E]/90 border border-white/[0.08] p-5 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Microsoft Azure AI Integration</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                      azureStatus?.overallMode?.includes('Azure Production')
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {azureStatus?.overallMode || 'Checking mode...'}
                  </span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Keys managed in <code className="text-purple-300 font-mono">backend/.env</code>
                </p>
              </div>
            </div>

            <button
              onClick={loadAzureStatus}
              disabled={isRefreshingAzure}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-neutral-300 hover:text-white flex items-center gap-1.5 self-start sm:self-auto transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshingAzure ? 'animate-spin' : ''}`} />
              <span>{isRefreshingAzure ? 'Checking...' : 'Check Status'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
            <div className="bg-[#0E0E14] border border-white/[0.06] p-3 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">Azure OpenAI</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    azureStatus?.services?.azureOpenAI?.status === 'connected'
                      ? 'bg-emerald-400'
                      : 'bg-amber-400'
                  }`}
                />
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block truncate">
                {azureStatus?.services?.azureOpenAI?.status === 'connected'
                  ? `Active (${azureStatus?.services?.azureOpenAI?.deployment})`
                  : 'Mock Mode Active'}
              </span>
            </div>

            <div className="bg-[#0E0E14] border border-white/[0.06] p-3 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">Azure AI Search</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    azureStatus?.services?.azureSearch?.status === 'connected'
                      ? 'bg-emerald-400'
                      : 'bg-amber-400'
                  }`}
                />
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block truncate">
                {azureStatus?.services?.azureSearch?.status === 'connected'
                  ? 'Index Connected'
                  : 'Local KB Grounding'}
              </span>
            </div>

            <div className="bg-[#0E0E14] border border-white/[0.06] p-3 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">Azure AI Speech</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    azureStatus?.services?.azureSpeech?.status === 'connected'
                      ? 'bg-emerald-400'
                      : 'bg-amber-400'
                  }`}
                />
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block truncate">
                {azureStatus?.services?.azureSpeech?.status === 'connected'
                  ? 'Neural STT & TTS'
                  : 'Web Speech API'}
              </span>
            </div>

            <div className="bg-[#0E0E14] border border-white/[0.06] p-3 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">Azure AI Vision</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    azureStatus?.services?.azureVision?.configured
                      ? 'bg-emerald-400'
                      : 'bg-blue-400'
                  }`}
                />
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block truncate">
                {azureStatus?.services?.azureVision?.configured
                  ? 'Cloud Vision Telemetry'
                  : 'Browser Framing'}
              </span>
            </div>
          </div>
        </div>

        {/* THREE CORE FEATURE MODULES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Core Preparation Modules</h3>
            <span className="text-xs text-neutral-400">3 AI Engines Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: AI Placement Chatbot */}
            <div className="card-elevated p-6 flex flex-col justify-between group">
              <div>
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">AI Placement Chatbot</h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  Ask placement questions and learn with AI grounded in curated curriculum notes.
                </p>
                <div className="bg-[#060608] rounded-lg p-2.5 border border-white/[0.07] mb-6 text-[11px] text-neutral-400">
                  <span className="text-neutral-200 font-semibold block mb-0.5">Popular doubt:</span>
                  &quot;Explain Binary Search on rotated arrays&quot;
                </div>
              </div>

              <Link
                href="/chat"
                className="w-full py-2.5 px-4 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-neutral-200 hover:text-white text-xs font-semibold border border-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <span>Open Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 2: AI Mock Interview */}
            <div className="card-elevated p-6 flex flex-col justify-between group border-purple-500/30">
              <div>
                <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-4 group-hover:scale-105 transition-transform">
                  <Video className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">AI Mock Interview</h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  Practice realistic interviews with Speech + Vision AI and get instant multi-criteria feedback.
                </p>
                <div className="bg-[#060608] rounded-lg p-2.5 border border-white/[0.07] mb-6 text-[11px] text-neutral-400">
                  <span className="text-neutral-200 font-semibold block mb-0.5">Next Recommended:</span>
                  Intermediate Technical Round (5 Questions)
                </div>
              </div>

              <Link
                href="/interview"
                className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Start Interview</span>
                <ArrowRight className="w-3.5 h-3.5 text-black" />
              </Link>
            </div>

            {/* Feature 3: AI Roadmap */}
            <div className="card-elevated p-6 flex flex-col justify-between group">
              <div>
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
                  <Map className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">AI Roadmap</h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  Follow your personalized preparation plan customized to your target role and timeline.
                </p>
                <div className="bg-[#060608] rounded-lg p-2.5 border border-white/[0.07] mb-6 text-[11px] text-neutral-400">
                  <span className="text-neutral-200 font-semibold block mb-0.5">Current Week:</span>
                  Week 2: Linked Lists, Stacks &amp; Dynamic Dispatch
                </div>
              </div>

              <Link
                href="/roadmap/view"
                className="w-full py-2.5 px-4 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-neutral-200 hover:text-white text-xs font-semibold border border-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <span>View Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* TODAY'S FOCUS SECTION */}
        <div className="card-surface p-6 space-y-4 bg-[#09090E]/90 border border-white/[0.08] rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Today&apos;s Focus</h3>
              <p className="text-xs text-neutral-400">Daily syllabus targets aligned with your 60-day roadmap.</p>
            </div>
            <Link href="/roadmap/view" className="text-xs text-purple-400 font-semibold hover:underline flex items-center gap-1">
              <span>Full Roadmap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {todayFocusItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#0E0E14] border border-white/[0.07] p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-purple-500/30 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold ${item.color} uppercase tracking-wider`}>
                        {item.subject}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <Clock className="w-3 h-3" />
                        <span>{item.duration}</span>
                      </div>
                    </div>
                    <h5 className="text-sm font-semibold text-white">{item.topic}</h5>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                    <div className="flex items-center gap-1.5 text-neutral-400">
                      <span className={`w-2 h-2 rounded-full ${item.completed ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <span>{item.completed ? 'Completed' : 'Pending Practice'}</span>
                    </div>
                    <Link
                      href="/chat"
                      className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                    >
                      Study Notes &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
