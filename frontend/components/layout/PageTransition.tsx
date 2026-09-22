'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ReactNode, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

const variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

interface PageTransitionProps {
  children: ReactNode;
}

function ScrollToTop() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const };

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
          style={{ willChange: 'opacity, transform' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}