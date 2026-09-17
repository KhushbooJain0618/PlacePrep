'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../../components/layout/Sidebar';
import {
  Map,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Code2,
  Database,
  Cpu,
  Globe
} from 'lucide-react';
import { api } from '../../lib/api';
import { DifficultyLevel } from '../../types';

export default function RoadmapGeneratorPage() {
  const router = useRouter();

  const [role, setRole] = useState('Software Developer');
  const [level, setLevel] = useState<DifficultyLevel>('Beginner');
  const [dailyHours, setDailyHours] = useState<number>(2);
  const [duration, setDuration] = useState<number>(60);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'DSA',
    'OOP',
    'DBMS',
    'Operating Systems',
    'SQL'
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles = [
    'Software Developer',
    'Java Developer',
    'Python Developer',
    'Data Analyst',
    'Web Developer'
  ];

  const levels: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

  const studyTimeOptions = [
    { label: '30 minutes', value: 0.5 },
    { label: '1 hour', value: 1 },
    { label: '2 hours', value: 2 },
    { label: '3 hours', value: 3 },
    { label: '4+ hours', value: 4 },
  ];

  const durationOptions = [
    { label: '30 days', value: 30, desc: 'Fast-track sprint' },
    { label: '45 days', value: 45, desc: 'Standard preparation' },
    { label: '60 days', value: 60, desc: 'Recommended balance' },
    { label: '90 days', value: 90, desc: 'Comprehensive mastery' },
  ];

  const availableTopics = [
    'DSA',
    'OOP',
    'DBMS',
    'Operating Systems',
    'Computer Networks',
    'SQL',
    'Programming',
    'Technical Interview'
  ];

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleGenerate = async () => {
    if (selectedTopics.length === 0) {
      setError('Please select at least one syllabus topic.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const roadmapData = await api.generateRoadmap({
        role,
        level,
        dailyHours,
        duration,
        topics: selectedTopics
      });

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('active_placement_roadmap', JSON.stringify(roadmapData));
      }

      router.push('/roadmap/view');
    } catch (err: any) {
      console.error('Roadmap generate error:', err);
      setError(err.message || 'Error generating roadmap. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex bg-navy-950">
      <Sidebar />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 overflow-y-auto">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-900 border border-navy-700 text-xs font-semibold text-brand-cyan mb-2">
            <Map className="w-3.5 h-3.5" />
            <span>AI Curriculum Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Build Your Personalized Placement Roadmap
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tell us where you are. We&apos;ll create a preparation plan for where you want to go.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Generator Form Card */}
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

          {/* Field 2: Current Skill Level */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Current Skill Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {levels.map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`p-3.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                    level === l
                      ? 'bg-brand-blue/20 border-brand-blue text-white shadow-sm'
                      : 'bg-navy-900 border-navy-700/80 text-slate-300 hover:text-white hover:bg-navy-850'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Field 3: Daily Study Time */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Daily Study Time
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {studyTimeOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDailyHours(opt.value)}
                  className={`p-3.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                    dailyHours === opt.value
                      ? 'bg-brand-blue/20 border-brand-blue text-white shadow-sm'
                      : 'bg-navy-900 border-navy-700/80 text-slate-300 hover:text-white hover:bg-navy-850'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Field 4: Preparation Duration */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Preparation Duration
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {durationOptions.map(dur => (
                <button
                  key={dur.value}
                  type="button"
                  onClick={() => setDuration(dur.value)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    duration === dur.value
                      ? 'bg-brand-blue/20 border-brand-blue text-white shadow-sm'
                      : 'bg-navy-900 border-navy-700/80 text-slate-300 hover:text-white hover:bg-navy-850'
                  }`}
                >
                  <p className="text-sm font-bold">{dur.label}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{dur.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Field 5: Selectable Topics Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Core Subjects &amp; Focus Topics
              </label>
              <span className="text-xs text-slate-400 font-mono">
                {selectedTopics.length} selected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {availableTopics.map(topic => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-brand-cyan/15 border-brand-cyan/60 text-white'
                        : 'bg-navy-900 border-navy-700/80 text-slate-400 hover:text-slate-200 hover:bg-navy-850'
                    }`}
                  >
                    <span className="text-xs font-semibold">{topic}</span>
                    <CheckCircle2
                      className={`w-4 h-4 transition-colors ${
                        isSelected ? 'text-brand-cyan' : 'text-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Action Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || selectedTopics.length === 0}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-brand-blue text-white font-bold text-sm shadow-lg shadow-brand-blue/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Generating Tailored Curriculum...</span>
            ) : (
              <>
                <span>Generate My Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
