'use client';

import React from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Video,
  Map,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Terminal,
  ShieldAlert,
  Mic,
  Cpu,
  Layers,
  Search,
  Compass
} from 'lucide-react';
import { Footer } from '../components/layout/Footer';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-navy-700/60 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950">
        {/* Subtle background glow effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-blue/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-850/90 border border-navy-700 shadow-inner mb-6 animate-pulse-subtle">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
            <span className="text-xs font-semibold tracking-wide text-slate-200">
              Campus Placement Preparation Assistant
            </span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Prepare Smarter. <br className="hidden sm:inline" />
            Interview Better. <br className="hidden sm:inline" />
            <span className="text-gradient-primary">Get Placement Ready.</span>
          </h1>

          {/* Supporting text */}
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            An AI-powered campus placement assistant that helps students learn, practice realistic interviews with speech and vision telemetry, and build a personalized preparation roadmap.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-brand-blue text-white font-semibold shadow-lg shadow-brand-blue/30 transition-all hover:scale-[1.02]"
            >
              <span>Start Preparing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-navy-850/90 hover:bg-navy-800 text-slate-200 hover:text-white font-semibold border border-navy-700 transition-all"
            >
              <span>Explore Features</span>
            </a>
          </div>

          {/* Hero Visual: Product Preview Dashboard */}
          <div className="mt-16 max-w-5xl mx-auto card-surface p-2 sm:p-4 shadow-2xl shadow-navy-950/80">
            <div className="bg-navy-950 rounded-xl p-4 sm:p-6 border border-navy-800 text-left">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-navy-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-slate-400 hidden sm:inline">placeprep-platform.azure.app</span>
                </div>
                <div className="flex items-center gap-2 text-brand-cyan">
                  <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping" />
                  <span>3 Core AI Modules Active</span>
                </div>
              </div>

              {/* 3 Core capabilities preview banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Capability 1 */}
                <div className="bg-navy-900 p-4 rounded-xl border border-navy-700/60">
                  <div className="flex items-center gap-2 text-brand-cyan mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">AI Chatbot</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium line-clamp-2">
                    &quot;Explain the difference between an Array and a Linked List with time complexity.&quot;
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-navy-800 text-brand-blue-light font-mono">RAG Grounded</span>
                    <span>&bull; 3 Sources Cited</span>
                  </div>
                </div>

                {/* Capability 2 */}
                <div className="bg-navy-900 p-4 rounded-xl border border-navy-700/60">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <Video className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Mock Interview</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium line-clamp-2">
                    Speech Transcription + Interaction Signal Telemetry + Multi-Criteria Evaluation.
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-navy-800 text-emerald-400 font-mono">Score 82%</span>
                    <span>&bull; Technical Feedback</span>
                  </div>
                </div>

                {/* Capability 3 */}
                <div className="bg-navy-900 p-4 rounded-xl border border-navy-700/60">
                  <div className="flex items-center gap-2 text-brand-blue-light mb-2">
                    <Map className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Roadmap</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium line-clamp-2">
                    60-Day Customized Curriculum for Software Developer placement prep.
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-navy-800 text-brand-cyan font-mono">42% Completed</span>
                    <span>&bull; Week 2 / 8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="py-20 bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-cyan mb-2">
              Structured Preparation
            </h2>
            <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Everything You Need for Placement Preparation
            </p>
            <p className="mt-4 text-slate-400 text-base">
              Engineered strictly around the three core pillars of modern technical campus placements.
            </p>
          </div>

          {/* Three Major Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: AI Placement Chatbot */}
            <div className="card-elevated p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-blue/15 border border-brand-blue/30 flex items-center justify-center text-brand-cyan mb-6">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">1. AI Placement Chatbot</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Get instant, placement-focused answers powered by AI and grounded in curated placement resources.
                </p>
                <div className="space-y-2 mb-8 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-cyan" />
                    <span>RAG knowledge grounding & citations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-cyan" />
                    <span>DSA, DBMS, OOP & System Design</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-cyan" />
                    <span>Complexity & code analysis</span>
                  </div>
                </div>
              </div>
              <Link
                href="/chat"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-navy-800 hover:bg-brand-blue text-slate-100 hover:text-white text-sm font-semibold border border-navy-700 transition-colors"
              >
                <span>Try AI Chat</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature 2: AI Mock Interview */}
            <div className="card-elevated p-8 flex flex-col justify-between border-brand-blue/30 relative">
              <div className="absolute -top-3 right-6 bg-gradient-to-r from-brand-blue to-brand-cyan text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-1 rounded-full shadow">
                Voice + Vision
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">2. AI Mock Interview</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Practice realistic technical interviews using AI Speech and AI Vision with instant feedback.
                </p>
                <div className="space-y-2 mb-8 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Real-time voice speech transcription</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Defensible visual interaction signals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Technical & relevance score breakdown</span>
                  </div>
                </div>
              </div>
              <Link
                href="/interview"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-brand-blue hover:bg-blue-600 text-white text-sm font-semibold shadow-md shadow-brand-blue/30 transition-all"
              >
                <span>Start Interview</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature 3: Personalized Roadmap */}
            <div className="card-elevated p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-brand-cyan mb-6">
                  <Map className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">3. Personalized Roadmap</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Generate a preparation plan based on your target role, current level, available time, and goals.
                </p>
                <div className="space-y-2 mb-8 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-cyan" />
                    <span>Custom 30, 45, 60, or 90 day schedule</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-cyan" />
                    <span>Day-by-day task checklist</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-cyan" />
                    <span>Live dynamic progress tracking</span>
                  </div>
                </div>
              </div>
              <Link
                href="/roadmap"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-navy-800 hover:bg-brand-blue text-slate-100 hover:text-white text-sm font-semibold border border-navy-700 transition-colors"
              >
                <span>Build My Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW PLACEPREP WORKS SECTION */}
      <section className="py-20 bg-navy-900/60 border-t border-b border-navy-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-cyan mb-2">
              Structured Methodology
            </h2>
            <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              How PlacePrep Works
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 01 */}
            <div className="card-surface p-6 relative">
              <div className="text-3xl font-black text-brand-blue/30 mb-4 font-mono">01</div>
              <h4 className="text-lg font-bold text-white mb-2">Tell us your goal</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Select your target placement role, current skill baseline, and daily study hours.
              </p>
            </div>

            {/* Step 02 */}
            <div className="card-surface p-6 relative">
              <div className="text-3xl font-black text-brand-blue/30 mb-4 font-mono">02</div>
              <h4 className="text-lg font-bold text-white mb-2">Practice with AI</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Clear conceptual doubts via grounded Chatbot and simulate live voice/video interviews.
              </p>
            </div>

            {/* Step 03 */}
            <div className="card-surface p-6 relative">
              <div className="text-3xl font-black text-brand-blue/30 mb-4 font-mono">03</div>
              <h4 className="text-lg font-bold text-white mb-2">Follow your roadmap</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Track daily milestones, complete focused problem sets, and log your progress.
              </p>
            </div>

            {/* Step 04 */}
            <div className="card-surface p-6 relative">
              <div className="text-3xl font-black text-brand-blue/30 mb-4 font-mono">04</div>
              <h4 className="text-lg font-bold text-white mb-2">Improve continuously</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Review question-by-question technical evaluations and strengthen targeted weak spots.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
