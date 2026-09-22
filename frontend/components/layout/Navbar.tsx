'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, MessageSquare, Video, Map, LayoutDashboard, Menu, X, User } from 'lucide-react';
import { authStorage } from '../../lib/api';

const EASE = [0.16, 1, 0.3, 1] as const;

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(authStorage.getUser());
    setMobileMenuOpen(false);
    setSolutionsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSolutionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const solutionItems = [
    { href: '/dashboard', label: 'Student Hub', desc: 'Placement readiness & overview', icon: LayoutDashboard },
    { href: '/chat', label: 'AI Placement Chatbot', desc: 'Grounded DSA & tech interview doubt solver', icon: MessageSquare },
    { href: '/interview', label: 'Mock Interview Studio', desc: 'Speech + Vision AI simulation & telemetry', icon: Video },
    { href: '/roadmap', label: 'Placement Roadmap', desc: 'Dynamic day-by-day prep curriculum', icon: Map },
  ];

  const navLinks = [
    { href: '/roadmap', label: 'Roadmap' },
    { href: '/interview', label: 'Mock Studio' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#07111F]/75 backdrop-blur-xl border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
            PlacePrep
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_2px_rgba(168,85,247,0.6)] inline-block ml-0.5"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {/* Solutions with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setSolutionsOpen((v) => !v)}
              onMouseEnter={() => setSolutionsOpen(true)}
              className="flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors duration-200 py-1"
            >
              <span>Solutions</span>
              <motion.span
                animate={{ rotate: solutionsOpen ? 180 : 0 }}
                transition={{ duration: 0.2, ease: EASE }}
              >
                <ChevronDown className={`w-3.5 h-3.5 ${solutionsOpen ? 'text-purple-400' : 'text-neutral-400'}`} />
              </motion.span>
            </button>

            <AnimatePresence>
              {solutionsOpen && (
                <motion.div
                  onMouseLeave={() => setSolutionsOpen(false)}
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-[#0B0B0F]/95 border border-white/[0.09] shadow-2xl shadow-black/80 backdrop-blur-2xl p-2 z-50 origin-top"
                >
                  {solutionItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSolutionsOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors duration-200 group"
                      >
                        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors duration-200">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors duration-200">
                            {item.label}
                          </div>
                          <div className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                            {item.desc}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative py-1 text-neutral-300 hover:text-white transition-colors duration-200"
              >
                <span className={active ? 'text-white' : ''}>{link.label}</span>
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-0 right-0 -bottom-1 h-[2px] rounded-full bg-purple-500"
                    transition={{ duration: 0.3, ease: EASE }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Nav Actions */}
        <div className="hidden md:flex items-center gap-5 text-sm">
          <a
            href="mailto:contact@placeprep.ai"
            className="text-neutral-300 hover:text-white transition-colors duration-200 font-medium"
          >
            Contact
          </a>

          {user ? (
            <Link href="/dashboard">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 text-white transition-colors duration-200 text-xs font-semibold"
              >
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>{user.name?.split(' ')[0] || 'Dashboard'}</span>
              </motion.div>
            </Link>
          ) : (
            <>
              <Link href="/signup">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-block bg-white text-black font-semibold px-4 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors duration-200 text-sm shadow-sm"
                >
                  Sign up
                </motion.span>
              </Link>
              <Link
                href="/login"
                className="text-neutral-300 hover:text-white transition-colors duration-200 font-medium"
              >
                Sign in
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 border border-white/10 transition-colors duration-200"
            aria-label="Toggle navigation menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileMenuOpen ? 'close' : 'open'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="md:hidden overflow-hidden border-b border-white/10 bg-[#07111F]/95 backdrop-blur-2xl"
          >
            <div className="px-5 pt-3 pb-6 space-y-3">
              <div className="space-y-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 px-2 py-1">
                  Modules
                </div>
                {solutionItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.04, ease: EASE }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] text-neutral-200 text-sm font-medium transition-colors duration-200"
                      >
                        <Icon className="w-4 h-4 text-purple-400" />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 bg-white text-black rounded-lg text-sm font-semibold shadow hover:bg-neutral-200 transition-colors duration-200"
                >
                  Sign up
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm text-neutral-300 hover:text-white font-medium transition-colors duration-200"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};