'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, MessageSquare, Video, Map, LayoutDashboard, Menu, X, Sparkles, User } from 'lucide-react';
import { authStorage } from '../../lib/api';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(authStorage.getUser());
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSolutionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pathname]);

  const solutionItems = [
    { href: '/dashboard', label: 'Student Hub', desc: 'Placement readiness & overview', icon: LayoutDashboard },
    { href: '/chat', label: 'AI Placement Chatbot', desc: 'Grounded DSA & tech interview doubt solver', icon: MessageSquare },
    { href: '/interview', label: 'Mock Interview Studio', desc: 'Speech + Vision AI simulation & telemetry', icon: Video },
    { href: '/roadmap', label: 'Placement Roadmap', desc: 'Dynamic day-by-day prep curriculum', icon: Map },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-black/75 backdrop-blur-xl border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Name (AssistAI-inspired crisp white typography) */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
            PlacePrep
            <span className="w-1.5 h-1.5 rounded-full bg-glow-purple shadow-glow-purple inline-block ml-0.5 animate-pulse" />
          </span>
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {/* Solutions with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setSolutionsOpen(!solutionsOpen)}
              onMouseEnter={() => setSolutionsOpen(true)}
              className="flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors py-1"
            >
              <span>Solutions</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${solutionsOpen ? 'rotate-180 text-purple-400' : 'text-neutral-400'}`} />
            </button>

            {solutionsOpen && (
              <div
                onMouseLeave={() => setSolutionsOpen(false)}
                className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-[#0B0B0F]/95 border border-white/[0.09] shadow-2xl shadow-black/80 backdrop-blur-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                {solutionItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSolutionsOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                          {item.label}
                        </div>
                        <div className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                          {item.desc}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <Link href="/roadmap" className="text-neutral-300 hover:text-white transition-colors">
            Roadmap
          </Link>
          <Link href="/interview" className="text-neutral-300 hover:text-white transition-colors">
            Mock Studio
          </Link>
        </nav>

        {/* Right Nav Actions (Contact, Sign up pill, Sign in) */}
        <div className="hidden md:flex items-center gap-5 text-sm">
          <a
            href="mailto:contact@placeprep.ai"
            className="text-neutral-300 hover:text-white transition-colors font-medium"
          >
            Contact
          </a>

          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 text-white transition text-xs font-semibold"
            >
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>{user.name?.split(' ')[0] || 'Dashboard'}</span>
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="bg-white text-black font-semibold px-4 py-1.5 rounded-lg hover:bg-neutral-200 transition-all text-sm shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                className="text-neutral-300 hover:text-white transition-colors font-medium"
              >
                Sign in
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 border border-white/10"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-black/95 backdrop-blur-2xl px-5 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 px-2 py-1">
              Modules
            </div>
            {solutionItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] text-neutral-200 text-sm font-medium"
                >
                  <Icon className="w-4 h-4 text-purple-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 bg-white text-black rounded-lg text-sm font-semibold shadow hover:bg-neutral-200 transition-colors"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2 text-sm text-neutral-300 hover:text-white font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
