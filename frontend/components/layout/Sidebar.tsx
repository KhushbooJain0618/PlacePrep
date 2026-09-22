'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Video,
  Map,
  User,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { api, authStorage } from '../../lib/api';
import { StudentUser } from '../../types';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<StudentUser | null>(null);

  useEffect(() => {
    const cached = authStorage.getUser();
    if (cached) setCurrentUser(cached);

    api.getMe().then(res => {
      if (res.user) setCurrentUser(res.user);
    }).catch(() => {});
  }, []);

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    api.logout();
    router.push('/login');
  };

  const displayName = currentUser?.name || 'Student';
  const displayRole = currentUser?.targetRole || 'Candidate';
  const displayYear = currentUser?.collegeYear || '';
  const displayProgress = currentUser?.preparationProgress ?? 0;

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ST';

  const mainLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/chat', label: 'AI Chatbot', icon: MessageSquare, badge: 'RAG' },
    { href: '/interview', label: 'Mock Interview', icon: Video, badge: 'Live' },
    { href: '/roadmap', label: 'Roadmap', icon: Map, badge: 'Plan' },
  ];

  const secondaryLinks = [
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:block select-none" aria-label="Sidebar navigation">
      <div className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-[#060608]/95 border-r border-white/[0.07] backdrop-blur-xl flex flex-col justify-between z-30 overflow-hidden overscroll-none select-none">
        <div className="p-4 space-y-5">
          {/* Placement Status Card */}
          <div className="p-3.5 bg-[#0B0B0F]/90 border border-white/[0.08] rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
              <span>Target Role</span>
              <span className="text-purple-400 font-semibold">Prep Active</span>
            </div>
            <p className="text-sm font-semibold text-white truncate">{displayRole}</p>
            <div className="mt-2.5">
              <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                <span>Readiness</span>
                <span className="text-neutral-200 font-medium">{displayProgress}%</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full" style={{ width: `${displayProgress}%` }} />
              </div>
            </div>
          </div>

          {/* Primary Navigation */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
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
                      ? 'bg-purple-500/10 text-white border border-purple-500/30 font-semibold shadow-sm'
                      : 'text-neutral-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-neutral-400'}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      isActive ? 'bg-purple-500/20 text-purple-300' : 'bg-white/[0.06] text-neutral-400'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <hr className="border-white/[0.07]" />

          {/* Secondary Links */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
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
                      ? 'bg-white/[0.07] text-white font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-neutral-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Student Badge Footer */}
        <div className="p-4 border-t border-white/[0.07] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-neutral-200">{displayName}</span>
              <span className="text-[10px] text-neutral-400">{displayYear}</span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-neutral-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
