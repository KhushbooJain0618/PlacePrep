'use client';

import React, { useState } from 'react';
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

export default function ProfilePage() {
  const [name, setName] = useState('Alex Sharma');
  const [email, setEmail] = useState('alex.sharma@college.edu');
  const [targetRole, setTargetRole] = useState('Software Developer');
  const [collegeYear, setCollegeYear] = useState('Final Year (Class of 2026)');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 flex bg-navy-950">
      <Sidebar />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 overflow-y-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Student Profile &amp; Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your personal placement target role and preparation preferences.
          </p>
        </div>

        {/* Profile Card */}
        <div className="card-surface p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-navy-800">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-brand-blue/20">
              AS
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{name}</h2>
              <p className="text-xs text-brand-cyan font-semibold">{targetRole} Aspirant</p>
              <p className="text-xs text-slate-400 mt-0.5">{email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-navy-900 border border-navy-700 text-slate-100 text-sm focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  College Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-navy-900 border border-navy-700 text-slate-100 text-sm focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Target Role
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-navy-900 border border-navy-700 text-slate-100 text-sm focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Academic Year
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={collegeYear}
                    onChange={(e) => setCollegeYear(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-navy-900 border border-navy-700 text-slate-100 text-sm focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              {saved ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile preferences updated successfully</span>
                </span>
              ) : <div />}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-brand-blue hover:bg-blue-600 text-white font-semibold text-xs shadow-md shadow-brand-blue/30 transition-all flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        </div>

        {/* Azure Account Connection Readiness */}
        <div className="card-surface p-6 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-brand-cyan" />
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
