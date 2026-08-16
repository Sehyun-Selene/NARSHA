import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, X } from 'lucide-react';
import { toast } from 'sonner';
import { REPORT_REASONS, submitReport, type ReportReason } from '../data/reports';
import { useT } from '../i18n';

/**
 * 후기 카드의 `⋯` 메뉴 → 신고 모달 (GNB PRD REQ-E / E-3).
 *
 * 앱 상세와 Discover 유형별 보기가 같은 컨트롤을 쓴다. 신고 진입점을 눈에 띄게
 * 두지 않는 이유는 오신고를 줄이기 위한 것이다 (§E-3 진입점: 우측 하단 `⋯`).
 */

const REASON_KEY: Record<ReportReason, `report.reason.${ReportReason}`> = {
  spam: 'report.reason.spam',
  abuse: 'report.reason.abuse',
  false_info: 'report.reason.false_info',
  privacy: 'report.reason.privacy',
  other: 'report.reason.other',
};

const DETAIL_MAX = 500;

export default function ReviewReportMenu({ reviewId }: { reviewId: string }) {
  const { t } = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // 바깥을 누르면 메뉴를 닫는다 — 후기 목록이라 메뉴가 여러 개 열려 있으면 혼란스럽다
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  const close = () => {
    setModalOpen(false);
    setReason('');
    setDetail('');
  };

  const send = async () => {
    if (!reason) {
      toast.error(t('report.reasonRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const r = await submitReport({ reviewId, reason, detail: detail.trim() || undefined });
      toast.success(r.duplicate ? t('report.already') : t('report.done'));
      close();
    } catch (e) {
      const code = e instanceof Error ? e.message : 'UNKNOWN';
      toast.error(code === 'RATE_LIMITED' ? t('report.rateLimited') : `${t('report.failed')} (${code})`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Discover 유형별 보기에서는 후기 카드 전체가 <Link> 다. 메뉴·모달 클릭이
    // 카드로 새어 나가면 앱 상세로 이동해 버리므로 여기서 끊는다.
    <div
      ref={wrapRef}
      className="relative"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <button
        type="button"
        aria-label={t('report.menu')}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen((v) => !v); }}
        className="p-1 rounded-md text-[#94a3b8] hover:text-[#64748b] hover:bg-[#f1f5f9] dark:hover:bg-[#232a36]"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-1 z-30 min-w-[120px] rounded-lg border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#151c27] shadow-lg py-1">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); setModalOpen(true); }}
            className="w-full text-left px-3 py-1.5 text-[13px] text-[#dc2626] hover:bg-[#fef2f2] dark:hover:bg-[#232a36]"
          >
            {t('report.open')}
          </button>
        </div>
      )}

      {/* 모달도 body 로 portal 한다 — 후기 카드는 <Link> 안이고, 조상에 filter·
          transform 이 걸리면 fixed 가 그 박스에 갇혀 잘린다 (헤더에서 실제로 겪었다) */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={close} />
          <div className="relative w-full sm:max-w-[420px] bg-[#ffffff] dark:bg-[#151c27] sm:rounded-[20px] rounded-t-[20px] shadow-2xl flex flex-col max-h-[92dvh]">
            <div className="flex items-start justify-between px-5 pt-5 pb-3">
              <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[17px] text-[#1e293b] dark:text-[#dce3f3]">
                {t('report.title')}
              </h2>
              <button type="button" onClick={close} aria-label={t('report.cancel')} className="p-1 text-[#94a3b8] hover:text-[#64748b]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 pb-5 overflow-y-auto">
              {/* 자동 숨김이 아니라는 점을 먼저 알린다 (결정 D10) */}
              <p className="text-[12px] leading-[1.6] text-[#64748b] dark:text-[#8a94a6] mb-4">
                {t('report.lead')}
              </p>

              <p className="text-[12px] font-bold text-[#1e293b] dark:text-[#dce3f3] mb-2">{t('report.reasonLabel')}</p>
              <div className="space-y-1.5 mb-4">
                {REPORT_REASONS.map((r) => (
                  <label key={r} className="flex items-center gap-2.5 text-[13px] text-[#1e293b] dark:text-[#dce3f3] cursor-pointer">
                    <input
                      type="radio"
                      name={`report-reason-${reviewId}`}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="accent-[#0ea5e9]"
                    />
                    {t(REASON_KEY[r])}
                  </label>
                ))}
              </div>

              <label className="block text-[12px] font-bold text-[#1e293b] dark:text-[#dce3f3] mb-1.5">
                {t('report.detailLabel')}
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value.slice(0, DETAIL_MAX))}
                rows={3}
                placeholder={t('report.detailPh')}
                className="w-full bg-[#f8fafc] dark:bg-[#0c141f] border border-[#e2e8f0] dark:border-[#232a36] rounded-[8px] px-3 py-2 text-[14px] text-[#1e293b] dark:text-[#dce3f3] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] resize-none"
              />
              <p className="mt-1 text-right text-[11px] text-[#94a3b8]">{detail.length}/{DETAIL_MAX}</p>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="flex-1 h-10 rounded-[10px] border border-[#e2e8f0] dark:border-[#232a36] text-[14px] text-[#64748b] dark:text-[#bec7d2]"
                >
                  {t('report.cancel')}
                </button>
                <button
                  type="button"
                  onClick={send}
                  disabled={submitting || !reason}
                  className="flex-1 h-10 rounded-[10px] bg-[#dc2626] text-white font-extrabold text-[14px] disabled:opacity-50"
                >
                  {t('report.submit')}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
