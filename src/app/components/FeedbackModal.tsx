import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import SuggestServiceModal from './SuggestServiceModal';
import BugReportForm from './BugReportForm';
import { useT } from '../i18n';

/**
 * 제보 창구 — 플로팅 '+' 버튼이 여는 팝업. 탭 두 개를 담는다 (사용자 요청).
 *   · 서비스 제안 (기본 탭)
 *   · 오류 제보
 *
 * 제안을 기본 탭으로 둔 이유 — '+' 버튼은 원래 서비스 제안 진입점이었고
 * 말풍선·툴팁도 그렇게 안내한다. 기본을 바꾸면 기존 유입이 끊긴다.
 *
 * 껍데기(오버레이·헤더·닫기)는 이 컴포넌트가 소유한다. 제안 폼은
 * `SuggestServiceModal` 의 `embedded` 모드로 폼만 받아 온다 — 그러지 않으면
 * 오버레이와 헤더가 두 겹으로 겹친다.
 */

type Tab = 'suggest' | 'bug';

export default function FeedbackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT();
  const [tab, setTab] = useState<Tab>('suggest');

  if (!open) return null;

  const tabClass = (active: boolean) =>
    `flex-1 h-11 text-[14px] font-bold transition-colors border-b-2 ${
      active
        ? 'border-[#0ea5e9] dark:border-[#8ecdff] text-[#0ea5e9] dark:text-[#8ecdff]'
        : 'border-transparent text-[#94a3b8] hover:text-[#64748b] dark:hover:text-[#bec7d2]'
    }`;

  // 헤더에 있는 소제목은 탭마다 다르다 — 무엇을 적는 곳인지 바로 알려야 한다
  const subtitle = tab === 'suggest' ? t('suggest.subtitle') : t('bug.subtitle');

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-[480px] bg-[#ffffff] dark:bg-[#151c27] sm:rounded-[20px] rounded-t-[20px] shadow-2xl flex flex-col max-h-[92dvh]">

        <div className="flex items-start justify-between px-6 pt-5 pb-3 shrink-0">
          <p className="text-[13px] leading-[1.6] text-[#64748b] dark:text-[#8a94a6] pr-4">
            {subtitle}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('suggest.cancel')}
            className="text-[#94a3b8] hover:text-[#1e293b] dark:hover:text-[#dce3f3] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex px-3 border-b border-[#e2e8f0] dark:border-[#232a36] shrink-0">
          <button type="button" onClick={() => setTab('suggest')} className={tabClass(tab === 'suggest')}>
            {t('feedback.tabSuggest')}
          </button>
          <button type="button" onClick={() => setTab('bug')} className={tabClass(tab === 'bug')}>
            {t('feedback.tabBug')}
          </button>
        </div>

        {tab === 'suggest'
          ? <SuggestServiceModal open embedded onClose={onClose} />
          : <div className="flex-1 overflow-y-auto"><BugReportForm onDone={onClose} /></div>}

      </div>
    </div>,
    document.body,
  );
}
