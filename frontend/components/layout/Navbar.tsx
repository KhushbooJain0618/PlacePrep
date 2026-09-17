'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, MessageSquare, Video, Map, LayoutDashboard, Menu, X, Shield, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/chat', label: 'AI Chatbot', icon: MessageSquare },
    { href: '/interview', label: 'Mock Interview', icon: Video },
    { href: '/roadmap', label: 'Roadmap', icon: Map },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-navy-950/85 backdrop-blur-md border-b border-navy-700/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center shadow-md shadow-brand-blue/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              PLACE<span className="text-brand-cyan">PREP</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase text-slate-400 font-medium">
              Campus AI Assistant
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-navy-850 text-brand-cyan border border-navy-700 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-navy-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-cyan' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA / Profile */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-slate-300 hover:text-white px-3 py-1.5 transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-brand-blue text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm shadow-brand-blue/30 transition-all hover:scale-[1.02]"
          >
            <User className="w-4 h-4" />
            <span>Student Hub</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900 border border-navy-700/60"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-navy-700 bg-navy-900/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-2">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-navy-850 text-brand-cyan border border-navy-700'
                    : 'text-slate-300 hover:text-white hover:bg-navy-850/60'
                }`}
              >
                <Icon className="w-5 h-5 text-brand-cyan" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-navy-800 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2 text-sm text-slate-300 hover:text-white font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 bg-brand-blue text-white rounded-lg text-sm font-semibold shadow"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
