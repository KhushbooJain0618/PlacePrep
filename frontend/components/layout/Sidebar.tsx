'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Video,
  Map,
  User,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const mainLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/chat', label: 'AI Chatbot', icon: MessageSquare, badge: 'RAG' },
    { href: '/interview', label: 'Mock Interview', icon: Video, badge: 'Live' },
    { href: '/roadmap', label: 'Roadmap', icon: Map, badge: 'Plan' },
  ];

  const secondaryLinks = [
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/profile#settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 bg-navy-900 border-r border-navy-700/80 min-h-[calc(100vh-4rem)] flex flex-col justify-between hidden md:flex">
      <div className="p-4 space-y-6">
        {/* Placement Status Card */}
        <div className="p-3 bg-navy-950/80 border border-navy-700/60 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Target Role</span>
            <span className="text-brand-cyan font-semibold">SWE Intern</span>
          </div>
          <p className="text-sm font-semibold text-slate-100">Software Developer</p>
          <div className="mt-2.5">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Readiness</span>
              <span className="text-slate-200 font-medium">42%</span>
            </div>
            <div className="w-full bg-navy-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-brand-blue to-brand-cyan h-1.5 rounded-full" style={{ width: '42%' }} />
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Core Modules
          </p>
          {mainLinks.map(link => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-blue/15 text-white border border-brand-blue/40 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-navy-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-cyan' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    isActive ? 'bg-brand-blue/30 text-brand-cyan' : 'bg-navy-800 text-slate-400'
                  }`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <hr className="border-navy-700/60" />

        {/* Secondary Links */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Account
          </p>
          {secondaryLinks.map(link => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-navy-850 text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-navy-850'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Student Badge Footer */}
      <div className="p-4 border-t border-navy-700/80 bg-navy-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center text-white font-bold text-xs">
            ST
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-200">Alex Sharma</span>
            <span className="text-[10px] text-slate-400">Class of 2026</span>
          </div>
        </div>
        <Link href="/login" className="text-slate-400 hover:text-red-400 p-1 rounded" title="Sign Out">
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
};
