'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ReactNode, useLayoutEffect, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authStorage } from '../../lib/api';

const variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

interface PageTransitionProps {
  children: ReactNode;
}

const PROTECTED_PREFIXES = ['/dashboard', '/chat', '/interview', '/roadmap', '/profile'];

function ScrollToTop() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'));

  useEffect(() => {
    if (isProtected) {
      const token = authStorage.getToken();
      if (!token) {
        setIsAuthorized(false);
        router.replace(`/signup?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
    }
    setIsAuthorized(true);
  }, [pathname, isProtected, router]);

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: 'easeOut' as const };

  if (isProtected && !isAuthorized) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-black">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={pathname}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          className="flex flex-col flex-1 w-full min-h-0"
          style={{ willChange: 'opacity' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}