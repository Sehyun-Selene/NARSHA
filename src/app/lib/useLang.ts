import { useEffect, useState } from 'react';

export type Lang = 'en' | 'ko';

const LANG_KEY = 'narsha-lang';
const LANG_EVENT = 'narsha-lang-change';

export function getLang(): Lang {
  try {
    return (localStorage.getItem(LANG_KEY) as Lang) ?? 'en';
  } catch {
    return 'en';
  }
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
    window.dispatchEvent(new Event(LANG_EVENT));
  };

  return [lang, setLang];
}

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
