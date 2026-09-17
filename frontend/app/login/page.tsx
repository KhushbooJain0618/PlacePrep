'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('student@college.edu');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock local authentication layer ready for Azure AD / MSAL
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-navy-950">
      {/* Left Column: Branding & Product Statement */}
      <div className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col justify-between bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 border-r border-navy-800">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-blue/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              PLACE<span className="text-brand-cyan">PREP</span>
            </span>
          </Link>

          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
            Welcome back to your <br />
            <span className="text-gradient-primary">placement journey.</span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm leading-relaxed max-w-md">
            Prepare smarter with AI-grounded doubts resolution, practice live speech &amp; vision technical interviews, and track your personalized roadmap.
          </p>

          <div className="mt-8 space-y-3 max-w-sm">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0" />
              <span>Grounded in curated DSA, DBMS &amp; System Design notes</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0" />
              <span>Realistic Speech &amp; Vision mock interview simulation</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0" />
              <span>Structured multi-week milestone schedule</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-navy-800 text-xs text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-cyan" />
          <span>Azure AD / Microsoft Entra ID Authentication Integration Ready</span>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="w-full md:w-1/2 p-8 lg:p-16 flex items-center justify-center bg-navy-950">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Student Login</h3>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to continue practicing and tracking your preparation milestones.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                College Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-navy-900 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-blue transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-navy-900 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-blue transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-navy-900 border-navy-700 text-brand-blue focus:ring-0"
                />
                <span>Remember me</span>
              </label>
              <button type="button" className="text-brand-cyan hover:underline">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-brand-blue hover:bg-blue-600 text-white font-semibold text-sm shadow-md shadow-brand-blue/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 pt-4">
            Don&apos;t have an account yet?{' '}
            <Link href="/signup" className="text-brand-cyan font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
