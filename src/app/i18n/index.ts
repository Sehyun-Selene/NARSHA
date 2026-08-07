import { useLang, getLang, type Lang } from '../lib/useLang';
import { DICT, type Entry, type StringKey } from './strings';
import { TAG_CHIP, TAG_LONG, type TagKey, type TagLongKey } from './tags';

export type { Entry, StringKey, TagKey, TagLongKey };
export { DICT, TAG_CHIP, TAG_LONG };

const warned = new Set<string>();

function warnOnce(key: string) {
  if (!import.meta.env.DEV || warned.has(key)) return;
  warned.add(key);
  console.warn(`[i18n] missing key: ${key}`);
}

/** 현재 언어 값 → EN 값 순으로 고른다. 둘 다 비면 빈 문자열. */
function pick(entry: Entry, lang: Lang): string {
  const value = lang === 'ko' ? entry.ko : entry.en;
  return value || entry.en || '';
}

/** 단일 문자열 조회. 없는 키는 키 문자열을 그대로 돌려준다 (R5.4). */
export function t(key: StringKey, lang: Lang): string {
  const entry = DICT[key] as Entry | Entry[] | undefined;
  if (!entry) {
    warnOnce(key);
    return key;
  }
  if (Array.isArray(entry)) {
    return entry.map(e => pick(e, lang)).filter(Boolean).join(' ');
  }
  return pick(entry, lang) || key;
}

/**
 * 여러 줄 카피 조회. 언어마다 줄 수가 다를 수 있으므로 빈 줄은 걸러낸다 (R3.1).
 * 단일 Entry 키에 써도 1개짜리 배열로 돌려준다.
 */
export function tLines(key: StringKey, lang: Lang): string[] {
  const entry = DICT[key] as Entry | Entry[] | undefined;
  if (!entry) {
    warnOnce(key);
    return [key];
  }
  const list = Array.isArray(entry) ? entry : [entry];
  return list.map(e => pick(e, lang)).filter(Boolean);
}

/** 필터 칩 / 태그 라벨. 사전에 없는 값은 값 자체를 표시한다. */
export function tagLabel(value: string, lang: Lang): string {
  const entry = (TAG_CHIP as Record<string, Entry>)[value];
  if (!entry) {
    warnOnce(`tag.${value}`);
    return value;
  }
  return pick(entry, lang) || value;
}

/** 앱 상세·운영자 화면용 서술형 태그 라벨. */
export function tagLongLabel(value: string, lang: Lang): string {
  const entry = (TAG_LONG as Record<string, Entry>)[value];
  if (!entry) return tagLabel(value, lang);
  return pick(entry, lang) || value;
}

/** 컴포넌트 밖(이벤트 핸들러·toast 등)에서 현재 언어로 조회할 때. */
export function tNow(key: StringKey): string {
  return t(key, getLang());
}

/**
 * 컴포넌트용 훅. 언어가 바뀌면 소비 컴포넌트가 다시 렌더된다.
 */
export function useT() {
  const [lang, setLang] = useLang();
  return {
    lang,
    setLang,
    t: (key: StringKey) => t(key, lang),
    tLines: (key: StringKey) => tLines(key, lang),
    tag: (value: string) => tagLabel(value, lang),
    tagLong: (value: string) => tagLongLabel(value, lang),
  };
}
