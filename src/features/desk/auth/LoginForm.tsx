import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { useLang } from '../../../app/lib/useLang';
import { READ_NO_LOGIN } from '../components/introCopy';
import { deskErrorMessage } from './deskErrors';

const T = {
  ko: {
    email: '이메일',
    password: '비밀번호',
    login: '로그인',
    loggingIn: '로그인 중…',
    forgot: '비밀번호를 잊으셨나요?',
    resetSent: '비밀번호 재설정 메일을 보냈어요. 메일함을 확인해 주세요.',
    resetNeedEmail: '먼저 이메일을 입력해 주세요.',
    startInvite: '초대코드로 시작하기',
  },
  en: {
    email: 'Email',
    password: 'Password',
    login: 'Log in',
    loggingIn: 'Logging in…',
    forgot: 'Forgot your password?',
    resetSent: 'A password reset email is on its way. Please check your inbox.',
    resetNeedEmail: 'Please enter your email first.',
    startInvite: 'Start with an invite code',
  },
} as const;

const inputClass =
  "w-full rounded-[10px] border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#0c141f] px-4 py-3 text-[15px] text-[#1e293b] dark:text-[#dce3f3] outline-none focus:border-[#8ecdff] transition-colors";

/** 로그인 폼 (모달·페이지 공용). */
export default function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const [lang] = useLang();
  const t = T[lang];
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      toast.error(deskErrorMessage('INVALID_LOGIN', lang));
      return;
    }
    onSuccess?.();
    const next = params.get('next');
    navigate(next && next.startsWith('/desk') ? next : '/desk/write', { replace: true });
  };

  const resetPassword = async () => {
    if (!email.trim()) {
      toast.info(t.resetNeedEmail);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/desk/settings`,
    });
    if (error) toast.error(deskErrorMessage('NETWORK', lang));
    else toast.success(t.resetSent);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-[13px] font-medium text-[#64748b] dark:text-[#bec7d2] mb-1.5">{t.email}</label>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[#64748b] dark:text-[#bec7d2] mb-1.5">{t.password}</label>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[15px] py-3 rounded-[10px] hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {busy ? t.loggingIn : t.login}
      </button>

      <div className="flex items-center justify-between text-[13px]">
        <button type="button" onClick={resetPassword} className="text-[#8ecdff] hover:underline">
          {t.forgot}
        </button>
        <Link to="/desk/join" className="text-[#8ecdff] hover:underline">
          {t.startInvite}
        </Link>
      </div>

      <p className="text-center text-[12px] text-[#94a3b8] pt-1">{READ_NO_LOGIN[lang]}</p>
    </form>
  );
}
