import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useLang } from '../../../app/lib/useLang';
import LoginForm from './LoginForm';
import { introCopy, DESK_TITLE } from '../components/introCopy';
import { countActiveAuthors } from '../api/profiles';

/**
 * 로그인 모달 (§3.2). 상단에 코너 성격 설명 문안을 먼저 보여준다.
 * /desk 피드 헤더의 「책상 주인이신가요?」에서 열 수 있고, /desk/login 페이지와
 * 같은 LoginForm 을 공유한다.
 */
export default function LoginDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [lang] = useLang();
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    countActiveAuthors().then((c) => active && setN(c)).catch(() => {});
    return () => {
      active = false;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-[460px] max-h-[90vh] overflow-y-auto rounded-[16px] bg-white dark:bg-[#151c27] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={lang === 'ko' ? '닫기' : 'Close'}
          className="absolute top-4 right-4 text-[#94a3b8] hover:text-[#1e293b] dark:hover:text-[#dce3f3]"
        >
          <X className="w-5 h-5" />
        </button>

        <p className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] tracking-[0.08em] uppercase text-[#8ecdff] mb-2 pr-6">
          {DESK_TITLE[lang]}
        </p>
        <p className="font-['Inter:Regular',sans-serif] text-[14px] leading-[1.75] text-[#1e293b] dark:text-[#dce3f3] mb-6">
          {introCopy(n, lang)}
        </p>

        <LoginForm onSuccess={onClose} />
      </div>
    </div>
  );
}
