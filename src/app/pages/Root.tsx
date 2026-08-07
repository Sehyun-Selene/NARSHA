import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { ThemeProvider } from '../context/ThemeContext';
import ScrollToTop from '../components/ScrollToTop';
import { useLang, syncHtmlLang } from '../lib/useLang';

export default function Root() {
  const [lang] = useLang();

  // <html lang> 을 실제 언어와 맞춘다 (PRD R5.8) — 스크린리더·번역기·한글 자간 CSS 분기.
  useEffect(() => { syncHtmlLang(lang); }, [lang]);

  return (
    <ThemeProvider>
      <ScrollToTop />
      <Outlet />
    </ThemeProvider>
  );
}
