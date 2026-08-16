import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useT } from '../../app/i18n';
import type { StringKey } from '../../app/i18n';
import {
  memberSignIn,
  memberSignUp,
  memberSignInWithGoogle,
  memberResetPassword,
} from './memberApi';

/**
 * 일반회원 로그인·가입 모달 (GNB PRD REQ-C / C-3).
 *
 * desk 로그인 경로(`/desk/login`, `/desk/join`)와 분리한다 — desk 는 초대코드
 * 기반이라 일반 학습자에게 노출되면 "코드가 없으면 못 쓰는 사이트"로 읽힌다.
 *
 * 배치는 표준을 따른다: Google 버튼 → `또는` 구분선 → 이메일/비밀번호 폼.
 */

const inputClass =
  'w-full bg-[#f8fafc] dark:bg-[#0c141f] border border-[#e2e8f0] dark:border-[#232a36] rounded-[8px] px-3 py-2.5 text-[14px] text-[#1e293b] dark:text-[#dce3f3] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]';

export default function MemberAuthModal({
  open,
  mode: initialMode,
  onClose,
  onDone,
}: {
  open: boolean;
  mode: 'login' | 'signup';
  onClose: () => void;
  onDone?: () => void;
}) {
  const { t } = useT();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const fail = (e: unknown) => {
    const code = e instanceof Error ? e.message : 'UNKNOWN';
    // 없는 키는 키 문자열이 그대로 나오므로, 모르는 코드는 UNKNOWN 으로 접는다
    const key = `member.err.${code}` as StringKey;
    const msg = t(key);
    toast.error(msg === key ? t('member.err.UNKNOWN') : msg);
  };

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === 'signup') {
        await memberSignUp({ email, password, displayName, agreed });
        // 이메일 확인이 켜진 프로젝트에서는 세션 없이 끝난다 — 안내를 나눠 띄운다
        toast.success(t('member.signedUp'));
        toast.message(t('member.confirmEmail'));
      } else {
        await memberSignIn(email, password);
        toast.success(t('member.welcome'));
      }
      onDone?.();
      onClose();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      // 성공하면 페이지가 Google 로 이동하므로 이후 코드는 실행되지 않는다
      await memberSignInWithGoogle();
    } catch (e) {
      fail(e);
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!email.trim()) {
      toast.error(t('member.err.EMAIL_INVALID'));
      return;
    }
    try {
      await memberResetPassword(email);
      toast.success(t('member.resetSent'));
    } catch (e) {
      fail(e);
    }
  };

  // ⚠️ 반드시 body 로 portal 한다.
  // 헤더에 `backdrop-blur` 가 걸려 있는데, backdrop-filter 가 있는 요소는
  // position:fixed 자손의 기준 박스가 된다. 헤더 안에서 그냥 렌더하면 모달이
  // 높이 64px 짜리 헤더 박스에 갇혀 위쪽(Google 버튼·구분선)이 잘린다.
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-[400px] bg-[#ffffff] dark:bg-[#151c27] sm:rounded-[20px] rounded-t-[20px] shadow-2xl flex flex-col max-h-[92dvh]">
        <div className="flex items-start justify-between px-5 pt-5 pb-1">
          <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[18px] text-[#1e293b] dark:text-[#dce3f3]">
            {t(mode === 'login' ? 'member.loginTitle' : 'member.signupTitle')}
          </h2>
          <button type="button" onClick={onClose} aria-label={t('my.cancel')} className="p-1 text-[#94a3b8] hover:text-[#64748b]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-5 pt-3 overflow-y-auto">
          <button
            type="button"
            onClick={() => void google()}
            disabled={busy}
            className="w-full h-11 rounded-[10px] border border-[#e2e8f0] dark:border-[#232a36] flex items-center justify-center gap-2 text-[14px] font-bold text-[#1e293b] dark:text-[#dce3f3] disabled:opacity-50"
          >
            {/* 인라인 SVG — 외부 이미지를 불러오지 않는다 */}
            <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-2.8-.4-4.1H24v8.1h12.5c-.3 2.1-1.6 5.2-4.7 7.3l7.6 5.9c4.5-4.2 6.7-10.3 6.7-17.2z" />
              <path fill="#FBBC05" d="M10.4 28.7A14.6 14.6 0 0 1 9.6 24c0-1.6.3-3.2.8-4.7l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6.1z" />
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2 1.4-4.8 2.4-8.3 2.4-6.4 0-11.7-3.7-13.6-8.9l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
            </svg>
            {t('member.google')}
          </button>

          <div className="flex items-center gap-3 my-4">
            <span className="flex-1 h-px bg-[#e2e8f0] dark:bg-[#232a36]" />
            <span className="text-[12px] text-[#94a3b8]">{t('member.or')}</span>
            <span className="flex-1 h-px bg-[#e2e8f0] dark:bg-[#232a36]" />
          </div>

          <div className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[12px] font-bold text-[#1e293b] dark:text-[#dce3f3] mb-1.5">
                  {t('member.displayName')}
                </label>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} />
                <p className="mt-1 text-[11px] text-[#94a3b8]">{t('member.displayNameHint')}</p>
              </div>
            )}

            <div>
              <label className="block text-[12px] font-bold text-[#1e293b] dark:text-[#dce3f3] mb-1.5">
                {t('member.email')}
              </label>
              <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#1e293b] dark:text-[#dce3f3] mb-1.5">
                {t('member.password')}
              </label>
              <input
                type="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
              {mode === 'signup' && <p className="mt-1 text-[11px] text-[#94a3b8]">{t('member.passwordHint')}</p>}
            </div>

            {mode === 'signup' && (
              <label className="flex items-start gap-2 text-[12px] leading-[1.6] text-[#64748b] dark:text-[#bec7d2] cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 accent-[#0ea5e9]"
                />
                {/* 실제로 열리는 링크여야 동의의 근거가 된다 */}
                <span>
                  {t('member.consentPre')}
                  <Link to="/terms" target="_blank" className="text-[#1b99dc] underline">
                    {t('title.terms')}
                  </Link>
                  {t('member.consentMid')}
                  <Link to="/privacy" target="_blank" className="text-[#1b99dc] underline">
                    {t('title.privacy')}
                  </Link>
                  {t('member.consentPost')}
                </span>
              </label>
            )}
          </div>

          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy}
            className="mt-4 w-full h-11 rounded-[10px] bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-extrabold text-[14px] disabled:opacity-50"
          >
            {t(mode === 'login' ? 'member.login' : 'member.signup')}
          </button>

          <div className="mt-3 flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-[12px] text-[#1b99dc] hover:underline"
            >
              {t(mode === 'login' ? 'member.toSignup' : 'member.toLogin')}
            </button>
            {mode === 'login' && (
              <button type="button" onClick={() => void reset()} className="text-[12px] text-[#94a3b8] hover:underline">
                {t('member.forgot')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
