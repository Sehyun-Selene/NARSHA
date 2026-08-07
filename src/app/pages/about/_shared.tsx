import { useEffect, useRef, useState, type ReactNode } from 'react';

/** 구역 액센트. Coral·Amber 는 각자의 섹션 밖에서 쓰지 않는다 (PRD R4.0). */
export type Tone = 'sky' | 'problem' | 'values';

const TONE_TEXT: Record<Tone, string> = {
  sky:      'text-[#0ea5e9] dark:text-[#8ecdff]',
  problem:  'text-[var(--accent-problem)]',
  values:   'text-[var(--accent-values)]',
};

const TONE_BAR: Record<Tone, string> = {
  sky:      'bg-[#0ea5e9] dark:bg-[#8ecdff]',
  problem:  'bg-[var(--accent-problem)]',
  values:   'bg-[var(--accent-values)]',
};

/**
 * 스크롤 진입 시 fade-up. `prefers-reduced-motion: reduce` 면 애니메이션 없이
 * 바로 보이게 한다 (PRD R4.13).
 */
export function Reveal({ children, className = '', delay = 0 }: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
      className={`transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
        shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** avcd 스타일 섹션 이터 — 짧은 가로 바 + 대문자 레이블. */
export function Eyebrow({ label, tone = 'sky' }: { label: string; tone?: Tone }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className={`block w-8 h-[3px] rounded-full ${TONE_BAR[tone]}`} aria-hidden="true" />
      <span
        className={`font-['Manrope:Bold',sans-serif] font-bold text-[12px] tracking-[0.18em] uppercase ${TONE_TEXT[tone]}`}
      >
        {label}
      </span>
    </div>
  );
}

/** 섹션 배경을 흰색 / 회색으로 교차시켜 스크롤 리듬을 만든다. */
export function Section({ id, alt = false, children }: {
  id?: string;
  alt?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 px-6 py-20 sm:py-24 ${
        alt ? 'bg-[#f8fafc] dark:bg-[#151c27]' : 'bg-[#ffffff] dark:bg-[#0c141f]'
      }`}
    >
      <div className="max-w-[1080px] mx-auto">{children}</div>
    </section>
  );
}

export const HEAD_CLASS =
  "font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[clamp(1.75rem,3vw+0.5rem,2.75rem)] leading-[1.25] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.03em]";

export const BODY_CLASS =
  "font-['Inter:Regular',sans-serif] text-[17px] leading-[1.75] text-[#64748b] dark:text-[#bec7d2]";

export const CARD_CLASS =
  'bg-[#ffffff] dark:bg-[#0c141f] rounded-[16px] border border-[#e2e8f0] dark:border-[#232a36] overflow-hidden';
