import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLang, type Lang } from '../lib/useLang';

const LOGO_SRC = '/narsha-logo.png';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "font-['Manrope:Medium',sans-serif] font-medium text-[14px] sm:text-[15px] tracking-[-0.4px] transition-colors whitespace-nowrap",
    isActive
      ? 'text-[#0ea5e9] dark:text-[#8ecdff]'
      : 'text-[#94a3b8] dark:text-[#94a3b8] hover:text-[#8ecdff] dark:hover:text-[#8ecdff]',
  ].join(' ');

const learningTypeButtonClass = ({ isActive }: { isActive: boolean }) =>
  [
    "font-['Manrope:Medium',sans-serif] font-medium text-[14px] sm:text-[15px] tracking-[-0.4px] transition-all",
    'rounded-full px-4 py-2 text-white whitespace-nowrap',
    'bg-[#0ea5e9] dark:bg-[#1b5a7a]',
    'hover:opacity-90 dark:hover:opacity-90',
    isActive ? 'ring-2 ring-[#8ecdff] ring-offset-2 ring-offset-[#f8fafc] dark:ring-offset-[#0c141f]' : '',
  ].join(' ');

/** 드로어 안에서 쓰는 큰 링크 스타일 */
const drawerLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block w-full font-['Manrope:Medium',sans-serif] font-medium text-[17px] py-3 transition-colors",
    isActive
      ? 'text-[#0ea5e9] dark:text-[#8ecdff]'
      : 'text-[#1e293b] dark:text-[#dce3f3] hover:text-[#8ecdff]',
  ].join(' ');

function LangToggle({ lang, setLang, className = '' }: { lang: Lang; setLang: (l: Lang) => void; className?: string }) {
  return (
    <div className={`flex gap-0.5 bg-[#f1f5f9] dark:bg-[#232a36] rounded-full p-0.5 shrink-0 ${className}`}>
      {(['en', 'ko'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-label={l === 'ko' ? '한국어' : 'English'}
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-all ${
            lang === l
              ? 'bg-white dark:bg-[#151c27] text-[#1e293b] dark:text-[#dce3f3] shadow-sm'
              : 'text-[#64748b] dark:text-[#8a94a6]'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function ThemeToggle({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="text-[#8ecdff] dark:text-[#8ecdff] hover:opacity-80 transition-opacity p-2 rounded-full shrink-0"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [lang, setLang] = useLang();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // 페이지 이동 시 드로어 닫기
  useEffect(() => setOpen(false), [location.pathname]);

  // 드로어 열린 동안 배경 스크롤 잠금 + Esc 로 닫기
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const clearReturnApp = () => localStorage.removeItem('narsha-return-app-id');

  return (
    <header className="fixed top-0 left-0 w-full backdrop-blur-[32px] bg-[rgba(248,250,252,0.8)] dark:bg-[rgba(12,20,31,0.8)] shadow-[0px_32px_64px_0px_rgba(46,53,65,0.08)] z-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={LOGO_SRC} alt="NARSHA Logo" className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
          <span className="font-['Manrope:Bold',sans-serif] font-bold text-[17px] sm:text-[18px] text-[#8ecdff] dark:text-[#8ecdff] tracking-[-1px]">
            NARSHA
          </span>
        </Link>

        {/* 데스크톱 내비게이션 — lg 미만에서는 햄버거로 대체 */}
        <div className="hidden lg:flex items-center justify-end gap-4 xl:gap-6 min-w-0">
          <nav className="flex items-center justify-end gap-4 xl:gap-6" aria-label="Main">
            <NavLink to="/" end className={navLinkClass}>Discover</NavLink>
            <NavLink to="/reviews" className={navLinkClass}>Reviews</NavLink>
            <NavLink to="/desk" className={navLinkClass}>
              {lang === 'ko' ? '나의 한국어 책상' : 'Korean Desks'}
            </NavLink>
            <NavLink to="/survey" end className={learningTypeButtonClass} onClick={clearReturnApp}>
              {lang === 'ko' ? '학습 유형 검사' : 'Want to know your Learning Type?'}
            </NavLink>
          </nav>
          <LangToggle lang={lang} setLang={setLang} />
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>

        {/* 모바일 — 햄버거 */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="lg:hidden p-2 -mr-2 text-[#1e293b] dark:text-[#dce3f3] shrink-0"
          aria-label={lang === 'ko' ? '메뉴 열기' : 'Open menu'}
          aria-expanded={open}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* 슬라이드 드로어 (lg 미만)
          헤더의 backdrop-blur 가 position:fixed 자식의 컨테이닝 블록이 되어
          드로어가 헤더 박스 안에 갇힌다 → body 로 포털해서 뷰포트 기준으로 띄운다. */}
      {createPortal(
      <div
        className={`lg:hidden fixed inset-0 z-[60] transition-opacity duration-200 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lang === 'ko' ? '메뉴' : 'Menu'}
          className="absolute top-0 right-0 h-full w-[78%] max-w-[320px] bg-white dark:bg-[#0c141f] shadow-xl flex flex-col"
          // Tailwind v4 의 translate 유틸 대신 인라인 transform 사용
          // (유틸이 translate 프로퍼티를 쓰면서 전환이 안정적으로 반영되지 않음)
          style={{
            transform: open ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 200ms ease-out',
          }}
        >
          <div className="flex items-center justify-between h-16 px-5 border-b border-[#e2e8f0] dark:border-[#232a36]">
            <span className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#8ecdff]">NARSHA</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 -mr-2 text-[#64748b] dark:text-[#bec7d2]"
              aria-label={lang === 'ko' ? '메뉴 닫기' : 'Close menu'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-2" aria-label="Mobile">
            <NavLink to="/" end className={drawerLinkClass}>Discover</NavLink>
            <NavLink to="/reviews" className={drawerLinkClass}>Reviews</NavLink>
            <NavLink to="/desk" className={drawerLinkClass}>
              {lang === 'ko' ? '나의 한국어 책상' : 'Korean Desks'}
            </NavLink>
            <NavLink to="/survey" end className={drawerLinkClass} onClick={clearReturnApp}>
              {lang === 'ko' ? '학습 유형 검사' : 'Learning Type Test'}
            </NavLink>
          </nav>

          <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-[#e2e8f0] dark:border-[#232a36]">
            <LangToggle lang={lang} setLang={setLang} />
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>
      </div>,
      document.body,
      )}
    </header>
  );
}
