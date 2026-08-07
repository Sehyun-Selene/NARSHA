import { useEffect, useState } from 'react';

export type Lang = 'en' | 'ko';

const LANG_KEY = 'narsha-lang';
const LANG_EVENT = 'narsha-lang-change';

function isLang(v: unknown): v is Lang {
  return v === 'ko' || v === 'en';
}

/** 브라우저 언어가 한국어면 'ko'. 그 외에는 'en'. */
function detectBrowserLang(): Lang {
  if (typeof navigator === 'undefined') return 'en';
  const candidates = [navigator.language, ...(navigator.languages ?? [])];
  return candidates.some(l => l?.toLowerCase().startsWith('ko')) ? 'ko' : 'en';
}

/**
 * 저장된 선택 → 브라우저 언어 → 'en' 순으로 결정한다.
 * 토글을 한 번이라도 누르면 localStorage 값이 브라우저 언어보다 우선한다.
 */
export function getLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (isLang(saved)) return saved;
  } catch {
    return 'en';
  }
  return detectBrowserLang();
}

/** <html lang> 을 실제 언어와 맞춘다 (스크린리더·번역기·CSS 한글 자간 분기). */
export function syncHtmlLang(lang: Lang = getLang()): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
}

/**
 * 언어 상태 훅. 시그니처는 유지하되, 커스텀 이벤트로 모든 소비자를 전역 동기화한다
 * (헤더 KO/EN 토글이 같은 화면의 desk 컴포넌트에도 즉시 반영되도록).
 */
export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>(() => getLang());

  useEffect(() => {
    const sync = () => setLangState(getLang());
    window.addEventListener(LANG_EVENT, sync);
    window.addEventListener('storage', sync); // 다른 탭
    return () => {
      window.removeEventListener(LANG_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const setLang = (l: Lang) => {
    try { localStorage.setItem(LANG_KEY, l); } catch { /* ignore */ }
    setLangState(l);
    syncHtmlLang(l);
    window.dispatchEvent(new Event(LANG_EVENT));
  };

  return [lang, setLang];
}

/**
 * @deprecated `i18n/strings.ts` 의 `suggest.*` 키를 쓸 것. 한 릴리스 동안만 유지한다.
 */
export const STRINGS = {
  en: {
    suggestBubble:  'Missing a service? Suggest one!',
    suggestTooltip: 'Suggest a service',
  },
  ko: {
    suggestBubble:  '없는 서비스가 있나요? 추천해주세요!',
    suggestTooltip: '서비스 제안하기',
  },
} as const;
