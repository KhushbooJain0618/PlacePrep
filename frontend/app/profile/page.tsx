'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { api, authStorage } from '../../lib/api';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [collegeYear, setCollegeYear] = useState('');
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

        {/* Azure Account Connection Readiness */}
        <div className="p-6 rounded-2xl bg-[#09090E]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Microsoft Entra ID / Student Single Sign-On</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            PlacePrep is architected for seamless institutional deployment via Microsoft Azure Active Directory (Entra ID) OAuth 2.0. Campus identity management can authenticate student batches automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
