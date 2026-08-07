import { useEffect } from 'react';
import { useLang } from './useLang';
import { t, type StringKey } from '../i18n';

const BRAND = 'NARSHA';

/**
 * 브라우저 탭 타이틀을 설정한다 (PRD R6.3).
 *   인자 없음        → `NARSHA`
 *   사전 키          → `<번역된 페이지명> · NARSHA`
 *   override 문자열  → `<그 문자열> · NARSHA` (앱 이름처럼 번역 대상이 아닌 값)
 *
 * 언어가 바뀌면 자동으로 다시 설정된다.
 */
export function useDocumentTitle(key?: StringKey, override?: string): void {
  const [lang] = useLang();

  useEffect(() => {
    const label = override ?? (key ? t(key, lang) : '');
    document.title = label ? `${label} · ${BRAND}` : BRAND;
  }, [key, override, lang]);
}
