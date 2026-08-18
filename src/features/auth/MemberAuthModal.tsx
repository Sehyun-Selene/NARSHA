import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useT } from '../../app/i18n';
import type { StringKey } from '../../app/i18n';
import {
  memberSignIn,
  memberSignUp,
  memberSignInWithGoogle,
  memberResetPassword,
  isDisplayNameAvailable,
} from './memberApi';

/**
 * 일반회원 로그인·가입 모달 (GNB PRD REQ-C / C-3).
 *
 * desk 로그인 경로(`/desk/login`, `/desk/join`)와 분리한다 — desk 는 초대코드
 * 기반이라 일반 학습자에게 노출되면 "코드가 없으면 못 쓰는 사이트"로 읽힌다.
 *
 * 배치는 표준을 따른다: Google 버튼 → `또는` 구분선 → 이메일/비밀번호 폼.
 *
 * 화면은 세 가지다 — `login` / `signup` / `reset`. 재설정을 별도 화면으로 둔 이유:
 * 로그인 폼에 입력해 둔 이메일을 조용히 가져다 쓰면 어느 주소로 메일이 갔는지
 * 사용자가 확인할 수 없고, 비어 있으면 왜 실패했는지도 알 수 없다.
 */

type Mode = 'login' | 'signup' | 'reset';

const inputClass =
  'w-full bg-[#f8fafc] dark:bg-[#0c141f] border border-[#e2e8f0] dark:border-[#232a36] rounded-[8px] px-3 py-2.5 text-[14px] text-[#1e293b] dark:text-[#dce3f3] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]';

/** 비밀번호 입력 + 눈 아이콘. 오타로 로그인이 막히는 걸 사용자가 직접 확인한다. */
function PasswordField({
  value,
  onChange,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  const { t } = useT();
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <input
        type={shown ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShown(!shown)}
        aria-label={t(shown ? 'member.hidePw' : 'member.showPw')}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#94a3b8] hover:text-[#64748b]"
      >
        {shown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

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
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  /** 표시명 사용 가능 여부 — 제출 전에 알려 준다 */
  const [nameState, setNameState] = useState<'idle' | 'checking' | 'free' | 'taken'>('idle');

  // 타이핑이 멈춘 뒤에만 조회한다. 글자마다 부르면 요청이 쏟아진다.
  useEffect(() => {
    const name = displayName.trim();
    if (mode !== 'signup' || name.length < 2) { setNameState('idle'); return; }

    setNameState('checking');
    let active = true;
    const timer = setTimeout(() => {
      void isDisplayNameAvailable(name).then(ok => {
        if (active) setNameState(ok ? 'free' : 'taken');
      });
    }, 400);

    return () => { active = false; clearTimeout(timer); };
  }, [displayName, mode]);

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
        if (nameState === 'taken') throw new Error('DISPLAY_NAME_TAKEN');
        const { needsEmailConfirm } = await memberSignUp({ email, password, displayName, agreed });
        // 토스트는 하나만 띄운다. 두 개를 연달아 띄우면 뒤에 뜬 것이 앞을 덮어
        // 가입 완료 안내가 보이지 않는다 (실제로 그렇게 가려졌다).
        toast.success(
          t('member.signedUp'),
          needsEmailConfirm
            ? { description: `${t('member.confirmEmail')} ${t('member.checkSpam')}`, duration: 8000 }
            : undefined,
        );
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

  const sendReset = async () => {
    if (!resetEmail.includes('@')) {
      toast.error(t('member.err.EMAIL_INVALID'));
      return;
    }
    setBusy(true);
    try {
      await memberResetPassword(resetEmail);
      // 화면에도 남긴다 — 토스트는 사라지므로 스팸함 안내가 함께 사라지면 안 된다
      setResetSent(true);
      toast.success(t('member.resetSent'));
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const title: StringKey =
    mode === 'login'
      ? 'member.loginTitle'
      : mode === 'signup'
        ? 'member.signupTitle'
        : 'member.resetTitle';

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
            {t(title)}
          </h2>
          <button type="button" onClick={onClose} aria-label={t('my.cancel')} className="p-1 text-[#94a3b8] hover:text-[#64748b]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'reset' ? (
          /* 재설정 화면 — 이메일만 받는다 */
          <form
            className="px-5 pb-5 pt-3 overflow-y-auto"
            onSubmit={(e) => {
              e.preventDefault();
              void sendReset();
            }}
          >
            <p className="text-[13px] leading-[1.7] text-[#64748b] dark:text-[#bec7d2] mb-4">
              {t('member.resetLead')}
            </p>

            <label className="block text-[12px] font-bold text-[#1e293b] dark:text-[#dce3f3] mb-1.5">
              {t('member.email')}
            </label>
            <input
              type="email"
              autoComplete="email"
              autoFocus
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className={inputClass}
            />

            {resetSent && (
              <div className="mt-3 rounded-[10px] bg-[#f0f9ff] dark:bg-[#0d2a3d] border border-[#bae6fd] dark:border-[#1e4a63] px-3 py-2.5">
                <p className="text-[12px] font-bold text-[#0369a1] dark:text-[#8ecdff]">{t('member.resetSent')}</p>
                <p className="mt-1 text-[12px] leading-[1.6] text-[#0369a1] dark:text-[#8ecdff]">{t('member.checkSpam')}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-4 w-full h-11 rounded-[10px] bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-extrabold text-[14px] disabled:opacity-50"
            >
              {busy ? t('member.resetSending') : t('member.resetSend')}
            </button>

            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setResetSent(false);
                }}
                className="text-[12px] text-[#1b99dc] hover:underline"
              >
                {t('member.backToLogin')}
              </button>
            </div>
          </form>
        ) : (
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

            {/* form 으로 감싸 Enter 로도 제출되게 한다 */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <div className="space-y-3">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-[12px] font-bold text-[#1e293b] dark:text-[#dce3f3] mb-1.5">
                      {t('member.displayName')}
                    </label>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className={`${inputClass} ${nameState === 'taken' ? 'border-[#dc2626] dark:border-[#f87171]' : ''}`}
                    />
                    {nameState === 'taken' ? (
                      <p className="mt-1 text-[11px] text-[#dc2626] dark:text-[#f87171]">{t('member.nameTaken')}</p>
                    ) : nameState === 'free' ? (
                      <p className="mt-1 text-[11px] text-[#059669] dark:text-[#34d399]">{t('member.nameFree')}</p>
                    ) : (
                      <p className="mt-1 text-[11px] text-[#94a3b8]">
                        {nameState === 'checking' ? t('member.nameChecking') : t('member.displayNameHint')}
                      </p>
                    )}
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
                  <PasswordField
                    value={password}
                    onChange={setPassword}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
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
                type="submit"
                disabled={busy}
                className="mt-4 w-full h-11 rounded-[10px] bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-extrabold text-[14px] disabled:opacity-50"
              >
                {t(mode === 'login' ? 'member.login' : 'member.signup')}
              </button>
            </form>

            <div className="mt-3 flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-[12px] text-[#1b99dc] hover:underline"
              >
                {t(mode === 'login' ? 'member.toSignup' : 'member.toLogin')}
              </button>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    // 로그인 폼에 쓴 이메일을 옮겨 준다. 화면에 보이므로 확인·수정할 수 있다
                    setResetEmail(email);
                    setMode('reset');
                  }}
                  className="text-[12px] text-[#94a3b8] hover:underline"
                >
                  {t('member.forgot')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
