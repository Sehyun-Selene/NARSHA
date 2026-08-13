import { useT } from '../i18n';
import { REVIEW_SORTS, type ReviewSort } from '../data/reviews';

const LABEL_KEY: Record<ReviewSort, 'sort.recent' | 'sort.ratingHigh' | 'sort.ratingLow'> = {
  recent: 'sort.recent',
  ratingHigh: 'sort.ratingHigh',
  ratingLow: 'sort.ratingLow',
};

/**
 * 후기 정렬 드롭다운 (GNB PRD REQ-F / F-2).
 * 앱 상세와 Discover 유형별 보기가 같은 컨트롤을 쓴다.
 */
export default function ReviewSortSelect({
  value,
  onChange,
}: {
  value: ReviewSort;
  onChange: (next: ReviewSort) => void;
}) {
  const { t } = useT();
  return (
    <select
      aria-label={t('sort.label')}
      value={value}
      onChange={e => onChange(e.target.value as ReviewSort)}
      className="h-8 rounded-md border border-[#e2e8f0] dark:border-[#232a36] bg-transparent px-2 text-[13px] text-[#64748b] dark:text-[#bec7d2]"
    >
      {REVIEW_SORTS.map(s => (
        <option key={s} value={s}>{t(LABEL_KEY[s])}</option>
      ))}
    </select>
  );
}
