import { useState } from 'react';

export type Lang = 'en' | 'ko';

const LANG_KEY = 'narsha-lang';

export function getLang(): Lang {
  try {
    return (localStorage.getItem(LANG_KEY) as Lang) ?? 'en';
  } catch {
    return 'en';
  }
}

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>(() => getLang());
  const setLang = (l: Lang) => {
    localStorage.setItem(LANG_KEY, l);
    setLangState(l);
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
