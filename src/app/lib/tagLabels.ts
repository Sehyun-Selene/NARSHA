import { TAG_LONG } from '../i18n/tags';

/**
 * 서술형 태그 라벨의 영어판.
 *
 * 사전은 `i18n/tags.ts` 의 `TAG_LONG` 하나뿐이다 — 여기서 영어 값만 뽑아 쓴다.
 * 라벨을 두 곳에 적어 두면 한쪽만 고치는 일이 생긴다.
 *
 * @deprecated 사용자에게 보이는 화면에서는 언어를 인식하는
 * `tagLongLabel(value, lang)` 을 쓸 것. 이 맵은 언어를 따지지 않는
 * 운영자 화면용으로만 남긴다.
 */
export const STRENGTH_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(TAG_LONG).map(([value, entry]) => [value, entry.en]),
);
