import { Link, NavLink } from 'react-router';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const LOGO_SRC = '/narsha-logo.png';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "font-['Manrope:Medium',sans-serif] font-medium text-[16px] tracking-[-0.4px] transition-colors",
    isActive
      ? 'text-[#0ea5e9] dark:text-[#8ecdff]'
      : 'text-[#94a3b8] dark:text-[#94a3b8] hover:text-[#8ecdff] dark:hover:text-[#8ecdff]',
  ].join(' ');

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 w-full backdrop-blur-[32px] bg-[rgba(248,250,252,0.8)] dark:bg-[rgba(12,20,31,0.8)] shadow-[0px_32px_64px_0px_rgba(46,53,65,0.08)] z-50">
      <div className="max-w-[1440px] mx-auto px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={LOGO_SRC} alt="NARSHA Logo" className="w-10 h-10 object-contain" />
          <span className="font-['Manrope:Bold',sans-serif] font-bold text-[20px] text-[#8ecdff] dark:text-[#8ecdff] tracking-[-1px]">
            NARSHA
          </span>
        </Link>

        <div className="flex items-center gap-8 shrink-0">
          <nav className="flex items-center gap-8" aria-label="Main">
            <NavLink to="/" end className={navLinkClass}>
              Discover
            </NavLink>
            <NavLink to="/reviews" className={navLinkClass}>
              Reviews
            </NavLink>
          </nav>
          <button
            type="button"
            onClick={toggleTheme}
            className="text-[#8ecdff] dark:text-[#8ecdff] hover:opacity-80 transition-opacity p-2 rounded-full shrink-0"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}