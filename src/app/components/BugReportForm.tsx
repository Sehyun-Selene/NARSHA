import { useState } from 'react';
import { toast } from 'sonner';
import {
  saveBugReport,
  checkRecentDuplicate,
  BUG_DESCRIPTION_MIN,
  BUG_DESCRIPTION_MAX,
} from '../data/bugReports';
import { useT } from '../i18n';

/**
 * 오류 제보 폼 (사용자 요청).
 *
 * 로그인을 요구하지 않는다 — 정작 로그인이 깨졌을 때 제보를 못 하면 창구가 아니다.
 * 발생 화면 URL 과 브라우저 정보는 `saveBugReport` 가 자동으로 붙이고, 무엇이
 * 함께 전송되는지 화면에 밝힌다 (몰래 수집하지 않는다).
 */

const inputClass =
  'w-full bg-[#f8fafc] dark:bg-[#0c141f] border border-[#e2e8f0] dark:border-[#232a36] rounded-[8px] px-3 py-2.5 text-[14px] text-[#1e293b] dark:text-[#dce3f3] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]';

export default function BugReportForm({ onDone }: { onDone: () => void }) {
  const { t } = useT();
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const body = description.trim();
    if (body.length < BUG_DESCRIPTION_MIN) {
      toast.error(t('bug.errShort'));
      return;
    }
    if (checkRecentDuplicate(body)) {
      toast.error(t('bug.errDupe'));
      return;
    }

    setSubmitting(true);
    try {
      await saveBugReport({ description: body, reporterEmail: email });
      toast.success(t('bug.done'));
      setDescription('');
      setEmail('');
      onDone();
    } catch (e) {
      const code = e instanceof Error ? e.message : 'UNKNOWN';
      toast.error(`${t('bug.fail')} (${code})`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-6 py-5 space-y-4">
      <div>
        <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[13px] text-[#1e293b] dark:text-[#dce3f3] mb-1.5">
          {t('bug.descLabel')} <span className="text-[#0ea5e9] dark:text-[#8ecdff]">*</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value.slice(0, BUG_DESCRIPTION_MAX))}
          rows={5}
          placeholder={t('bug.descPh')}
          className={`${inputClass} resize-none leading-[1.6]`}
        />
        <p className="mt-1 text-right text-[11px] text-[#94a3b8]">
          {description.trim().length}/{BUG_DESCRIPTION_MAX}
        </p>
      </div>

      <div>
        <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[13px] text-[#1e293b] dark:text-[#dce3f3] mb-1.5">
          {t('bug.emailLabel')}{' '}
          <span className="font-normal text-[12px] text-[#94a3b8]">{t('bug.emailHint')}</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      {/* 무엇이 함께 전송되는지 밝힌다 */}
      <p className="text-[11px] leading-[1.6] text-[#94a3b8] dark:text-[#64748b] bg-[#f8fafc] dark:bg-[#0c141f] rounded-[8px] px-3 py-2">
        {t('bug.contextNote')}
      </p>

      <button
        type="button"
        onClick={() => void submit()}
        disabled={submitting}
        className="w-full h-11 rounded-[10px] bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-extrabold text-[14px] disabled:opacity-50"
      >
        {submitting ? t('bug.submitting') : t('bug.submit')}
      </button>
    </div>
  );
}
