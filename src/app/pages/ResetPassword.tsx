import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../../lib/supabase';
import { useT } from '../i18n';
import { useDocumentTitle } from '../lib/useDocumentTitle';

/**
 * 비밀번호 재설정 도착 화면.
 *
 * 이전에는 재설정 메일의 링크가 홈(`/`)으로 왔다. supabase-js 가 URL 의 복구
 * 토큰으로 세션을 만들어 주긴 하지만, 일반회원이 새 비밀번호를 정할 화면이
 * 없어서 흐름이 끊겨 있었다 — 비밀번호 변경 코드는 desk 저자 전용 설정 화면에만
 * 있었고 회원은 그 가드를 통과할 수 없다.
 *
 * 이 화면은 그 링크의 도착지다. 링크로 들어오면 세션이 생기므로 그 세션으로
 * `updateUser({ password })` 를 호출한다. 세션이 없으면 링크가 만료된 경우이므로
 * 다시 요청하도록 안내한다.
 */

const PASSWORD_MIN = 8;

const inputClass =
  'w-full bg-[#f8fafc] dark:bg-[#0c141f] border border-[#e2e8f0] dark:border-[#232a36] rounded-[8px] px-3 py-2.5 text-[14px] text-[#1e293b] dark:text-[#dce3f3] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]';

export default function ResetPassword() {
  const { t } = useT();
  useDocumentTitle('reset.title');
  const navigate = useNavigate();

  const [ready, setReady] = useState<'checking' | 'ok' | 'noSession'>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  // 복구 링크의 토큰 처리는 supabase-js 가 URL 을 읽어 자동으로 한다.
  // 그 결과 세션이 생겼는지만 확인한다.
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setReady(data.session ? 'ok' : 'noSession');
    });

    // 링크 처리가 늦게 끝나는 경우가 있어 이벤트도 함께 듣는다
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady('ok');
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  const submit = async () => {
    if (password.length < PASSWORD_MIN) { toast.error(t('reset.tooShort')); return; }
    if (password !== confirm) { toast.error(t('reset.mismatch')); return; }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
      toast.success(t('reset.done'));
      navigate('/');
    } catch (e) {
      const code = e instanceof Error ? e.message : 'UNKNOWN';
      toast.error(`${t('reset.failed')} (${code})`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-[420px] mx-auto px-4 sm:px-8 py-16">
          <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[26px] text-[#1e293b] dark:text-[#dce3f3] mb-2">
            {t('reset.title')}
          </h1>

          {ready === 'checking' && (
            <div className="flex justify-center py-16" aria-busy="true">
              <div className="w-8 h-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {ready === 'noSession' && (
            <>
              <p className="text-[14px] leading-[1.7] text-[#64748b] dark:text-[#bec7d2] mb-6">
                {t('reset.noLink')}
              </p>
              <Link to="/" className="text-[14px] font-bold text-[#1b99dc] hover:underline">
                {t('reset.goHome')}
              </Link>
            </>
          )}

          {ready === 'ok' && (
            <>
              <p className="text-[14px] leading-[1.7] text-[#64748b] dark:text-[#bec7d2] mb-6">
                {t('reset.lead')}
              </p>

              <label className="block text-[12px] font-bold text-[#1e293b] dark:text-[#dce3f3] mb-1.5">
                {t('reset.newLabel')}
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`${inputClass} mb-1`}
              />
              <p className="text-[11px] text-[#94a3b8] mb-4">{t('member.passwordHint')}</p>

              <label className="block text-[12px] font-bold text-[#1e293b] dark:text-[#dce3f3] mb-1.5">
                {t('reset.again')}
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className={`${inputClass} mb-5`}
              />

              <button
                type="button"
                onClick={() => void submit()}
                disabled={saving}
                className="w-full h-11 rounded-[10px] bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-extrabold text-[14px] disabled:opacity-50"
              >
                {saving ? t('reset.saving') : t('reset.submit')}
              </button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
