'use client';

import { useEffect, useState, type RefObject } from 'react';
import { ChevronDown } from 'lucide-react';

interface ScrollToBottomButtonProps {
  scrollContainerRef: RefObject<HTMLElement | null>;
}

export function ScrollToBottomButton({ scrollContainerRef }: ScrollToBottomButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onScroll = () => {
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      setVisible(dist > 100);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollContainerRef]);

  if (!visible) return null;

  return (
    <div className="flex justify-center py-2">
      <button
        onClick={() => {
          const el = scrollContainerRef.current;
          if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        }}
        aria-label="Scroll to bottom"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-neutral-800 text-white shadow-lg transition-colors hover:bg-neutral-700"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}
