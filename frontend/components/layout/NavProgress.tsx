'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function NavProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-[2px] z-[100] bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-500"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, transition: { duration: 0.4, ease: 'easeOut' } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          style={{ transformOrigin: 'left' }}
        />
      )}
    </AnimatePresence>
  );
}