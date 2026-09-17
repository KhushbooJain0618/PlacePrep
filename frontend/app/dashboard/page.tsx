'use client';

import React from 'react';
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
  ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const todayFocusItems = [
    {
      subject: 'DSA',
      topic: 'Arrays & Two Pointers',
      detail: 'Solve 3 medium problems: Maximum Subarray, 3Sum, Trapping Rain Water',
      duration: '45 mins',
      completed: true,
      icon: Code2,
      color: 'text-brand-blue-light'
    },
    {
      subject: 'OOP',
      topic: 'Inheritance & VTABLE',
      detail: 'Review virtual methods, dynamic dispatch, and interface vs abstract class',
      duration: '30 mins',
      completed: false,
      icon: Layers,
      color: 'text-brand-cyan'
    },
    {
      subject: 'SQL',
      topic: 'Joins & Aggregation Queries',
      detail: 'Practice writing queries with INNER, LEFT, and FULL OUTER joins',
      duration: '30 mins',
      completed: false,
      icon: Database,
      color: 'text-amber-400'
    }
  ];

  return (
    <div className="flex-1 flex bg-navy-950">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Dashboard Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
        {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Good morning, Student <span className="inline-block animate-wave origin-bottom-right">👋</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Let&apos;s make progress toward your placement goal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-700/80 text-xs font-semibold text-brand-cyan">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Hiring Sprint 2026</span>
            </span>
          </div>
        </div>

        {/* Hero / Summary Card: Your Placement Journey */}
        <div className="card-surface p-6 sm:p-8 bg-gradient-to-br from-navy-900 via-navy-850 to-navy-900 border-navy-700/80 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">
                  Overview
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  Your Placement Journey
                </h2>
              </div>
              <span className="text-xs text-slate-400 bg-navy-950 px-3 py-1.5 rounded-full border border-navy-700">
                Placement Window: Day 22 of 60
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-navy-950/70 border border-navy-700/60 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Target Role</span>
                <p className="text-lg font-bold text-white mt-1">Software Developer</p>
                <span className="text-[11px] text-brand-cyan mt-0.5 block">Full-Stack / Core Backend</span>
              </div>

              <div className="bg-navy-950/70 border border-navy-700/60 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">Preparation Progress</span>
                  <span className="text-xs font-bold text-brand-cyan">42%</span>
                </div>
                <div className="w-full bg-navy-800 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-blue to-brand-cyan h-2 rounded-full transition-all duration-500"
                    style={{ width: '42%' }}
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-2 block">18 of 42 Core Modules Checked</span>
              </div>

              <div className="bg-navy-950/70 border border-navy-700/60 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Days Remaining</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-black text-white font-mono">38</p>
                  <span className="text-xs text-slate-400">days until placement drive</span>
                </div>
                <span className="text-[11px] text-emerald-400 mt-0.5 block font-medium">&bull; On track with schedule</span>
              </div>
            </div>
          </div>
        </div>

        {/* THREE CORE FEATURE CARDS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Core Preparation Modules</h3>
            <span className="text-xs text-slate-400">3 AI Engines Ready</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: AI Placement Chatbot */}
            <div className="card-elevated p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-blue/15 border border-brand-blue/30 flex items-center justify-center text-brand-cyan mb-4 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">AI Placement Chatbot</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Ask placement questions and learn with AI grounded in curated curriculum notes.
                </p>
                <div className="bg-navy-950/80 rounded-lg p-2.5 border border-navy-700/60 mb-6 text-[11px] text-slate-400">
                  <span className="text-slate-200 font-semibold block mb-0.5">Popular doubt:</span>
                  &quot;Explain Binary Search on rotated arrays&quot;
                </div>
              </div>

              <Link
                href="/chat"
                className="w-full py-2.5 px-4 rounded-lg bg-navy-800 hover:bg-brand-blue text-slate-200 hover:text-white text-xs font-semibold border border-navy-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>Open Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 2: AI Mock Interview */}
            <div className="card-elevated p-6 flex flex-col justify-between group border-brand-blue/40">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                  <Video className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">AI Mock Interview</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Practice realistic interviews with Speech + Vision AI and get instant multi-criteria feedback.
                </p>
                <div className="bg-navy-950/80 rounded-lg p-2.5 border border-navy-700/60 mb-6 text-[11px] text-slate-400">
                  <span className="text-slate-200 font-semibold block mb-0.5">Next Recommended:</span>
                  Intermediate Technical Round (5 Questions)
                </div>
              </div>

              <Link
                href="/interview"
                className="w-full py-2.5 px-4 rounded-lg bg-brand-blue hover:bg-blue-600 text-white text-xs font-semibold shadow-md shadow-brand-blue/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Start Interview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 3: AI Roadmap */}
            <div className="card-elevated p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-brand-cyan mb-4 group-hover:scale-105 transition-transform">
                  <Map className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">AI Roadmap</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Follow your personalized preparation plan customized to your target role and timeline.
                </p>
                <div className="bg-navy-950/80 rounded-lg p-2.5 border border-navy-700/60 mb-6 text-[11px] text-slate-400">
                  <span className="text-slate-200 font-semibold block mb-0.5">Current Week:</span>
                  Week 2: Linked Lists, Stacks &amp; Dynamic Dispatch
                </div>
              </div>

              <Link
                href="/roadmap/view"
                className="w-full py-2.5 px-4 rounded-lg bg-navy-800 hover:bg-brand-blue text-slate-200 hover:text-white text-xs font-semibold border border-navy-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>View Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* TODAY'S FOCUS SECTION */}
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Today&apos;s Focus</h3>
              <p className="text-xs text-slate-400">Daily syllabus targets aligned with your 60-day roadmap.</p>
            </div>
            <Link href="/roadmap/view" className="text-xs text-brand-cyan font-semibold hover:underline flex items-center gap-1">
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
                  className="bg-navy-900 border border-navy-700/70 p-4 rounded-xl flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold ${item.color} uppercase tracking-wider`}>
                        {item.subject}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{item.duration}</span>
                      </div>
                    </div>
                    <h5 className="text-sm font-semibold text-slate-100">{item.topic}</h5>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-navy-800 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className={`w-2 h-2 rounded-full ${item.completed ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <span>{item.completed ? 'Completed' : 'Pending Practice'}</span>
                    </div>
                    <Link
                      href="/chat"
                      className="text-xs text-brand-cyan hover:underline font-medium"
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
