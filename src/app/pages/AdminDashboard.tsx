import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  getBoostSuggestions,
  getAccuracyChecks,
  dismissAlert,
  addTagToApp,
  removeTagFromApp,
  type BoostSuggestion,
  type AccuracyCheck,
} from '../data/adminAlerts';
import { STRENGTH_LABELS } from '../lib/tagLabels';
import { ALERT_THRESHOLDS } from '../lib/alertThresholds';
import { useDeskAuth } from '../../features/desk/auth/useDeskAuth';
import { supabase } from '../../lib/supabase';

function tagLabel(tag: string) {
  return STRENGTH_LABELS[tag] ?? tag;
}

function BoostCard({
  item,
  onAction,
}: {
  item: BoostSuggestion;
  onAction: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const handle = async (action: 'added' | 'ignored') => {
    setLoading(action);
    try {
      if (action === 'added') {
        await addTagToApp(item.appId, item.suggestedTag, item.currentTags);
      }
      await dismissAlert({
        alertType: 'boost_suggestion',
        appId: item.appId,
        tag: item.suggestedTag,
        actionTaken: action,
      });
      toast.success(
        action === 'added'
          ? `"${tagLabel(item.suggestedTag)}" added to ${item.appName}.`
          : `Alert snoozed for ${ALERT_THRESHOLDS.boostSuggestion.cooldownDays} days.`
      );
      onAction();
    } catch {
      toast.error('Action failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-[#e0f2fe] dark:bg-[#0f3a4a] border-l-4 border-[#0ea5e9] dark:border-[#1b99dc] rounded-[12px] p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <span className="inline-block text-[11px] font-bold tracking-[0.08em] uppercase text-[#0c4a6e] dark:text-[#8ecdff] mb-1">
            📢 보강 제안
          </span>
          <h3 className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#0c4a6e] dark:text-[#dce3f3]">
            {item.appName}
          </h3>
        </div>
        <span className="shrink-0 text-[13px] font-bold text-[#0ea5e9] dark:text-[#8ecdff]">
          {item.supporterPct}%
        </span>
      </div>
      <p className="text-[14px] text-[#0c4a6e] dark:text-[#bec7d2] mb-1">
        리뷰 {item.totalReviews}개 중 {item.supporterCount}명이 이 강점을 선택했어요:
      </p>
      <p className="font-bold text-[15px] text-[#0c4a6e] dark:text-[#8ecdff] mb-1">
        → {tagLabel(item.suggestedTag)}
        <span className="ml-2 text-[12px] font-normal text-[#64748b] dark:text-[#8a94a6]">({item.suggestedTag})</span>
      </p>
      <p className="text-[13px] text-[#64748b] dark:text-[#8a94a6] mb-4">
        운영자 차별점에 없는 항목이에요.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => handle('added')}
          disabled={loading !== null}
          className="bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] font-bold text-[13px] px-4 py-2 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading === 'added' ? '처리 중…' : '추가하기'}
        </button>
        <button
          onClick={() => handle('ignored')}
          disabled={loading !== null}
          className="bg-[#f1f5f9] dark:bg-[#232a36] text-[#64748b] dark:text-[#8a94a6] font-bold text-[13px] px-4 py-2 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading === 'ignored' ? '처리 중…' : `${ALERT_THRESHOLDS.boostSuggestion.cooldownDays}일 무시`}
        </button>
      </div>
    </div>
  );
}

function AccuracyCard({
  item,
  onAction,
}: {
  item: AccuracyCheck;
  onAction: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const handle = async (action: 'kept' | 'removed') => {
    setLoading(action);
    try {
      if (action === 'removed') {
        // Fetch current tags first
        const { data } = await import('../../lib/supabase').then(m =>
          m.supabase.from('apps').select('differentiators').eq('id', item.appId).single()
        );
        const tags = (data as { differentiators: string[] } | null)?.differentiators ?? [];
        await removeTagFromApp(item.appId, item.currentTag, tags);
      }
      await dismissAlert({
        alertType: 'accuracy_check',
        appId: item.appId,
        tag: item.currentTag,
        actionTaken: action,
      });
      toast.success(
        action === 'removed'
          ? `"${tagLabel(item.currentTag)}" removed from ${item.appName}.`
          : `Tag kept. Alert dismissed.`
      );
      onAction();
    } catch {
      toast.error('Action failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-[#fffbeb] dark:bg-[#1c1810] border-l-4 border-[#f59e0b] rounded-[12px] p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <span className="inline-block text-[11px] font-bold tracking-[0.08em] uppercase text-[#78350f] dark:text-[#fbbf24] mb-1">
            ⚠️ 정확성 검토 필요
          </span>
          <h3 className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#78350f] dark:text-[#dce3f3]">
            {item.appName}
          </h3>
        </div>
        <span className="shrink-0 text-[13px] font-bold text-[#f59e0b]">
          {item.supporterPct}%
        </span>
      </div>
      <p className="text-[14px] text-[#78350f] dark:text-[#bec7d2] mb-1">
        운영자가 표기한 강점 <strong>{tagLabel(item.currentTag)}</strong>을/를
      </p>
      <p className="text-[14px] text-[#78350f] dark:text-[#bec7d2] mb-4">
        리뷰 {item.totalReviews}개 중 {item.supporterCount}명({item.supporterPct}%)만 선택했어요.
        <span className="ml-2 text-[12px] text-[#64748b] dark:text-[#8a94a6]">({item.currentTag})</span>
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => handle('kept')}
          disabled={loading !== null}
          className="bg-[#f1f5f9] dark:bg-[#232a36] text-[#64748b] dark:text-[#8a94a6] font-bold text-[13px] px-4 py-2 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading === 'kept' ? '처리 중…' : '유지하기'}
        </button>
        <button
          onClick={() => handle('removed')}
          disabled={loading !== null}
          className="bg-[#f59e0b] text-white font-bold text-[13px] px-4 py-2 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading === 'removed' ? '처리 중…' : '제거하기'}
        </button>
      </div>
    </div>
  );
}

/**
 * 운영자 로그인 (REQ-H).
 *
 * 이전 구현은 `VITE_ADMIN_PASSWORD` 를 브라우저에서 문자열 비교하고 통과 여부를
 * localStorage 플래그로 유지했다. `VITE_` 값은 빌드 결과물에 인라인되어 배포된
 * JS 에서 읽을 수 있고, 플래그는 콘솔에서 그냥 만들 수 있어 통제가 아니었다.
 * `/desk` 운영 탭에서 이미 쓰던 방식(Supabase Auth 세션 + 서버에 저장된 역할)으로
 * 통일한다. 경로를 숨기는 `VITE_ADMIN_PATH` 는 유지하되 보안 수단으로 보지 않는다.
 */
function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (authError) {
      setError(true);
      setPassword('');
    }
    // 성공 시 AuthProvider 가 세션 변경을 받아 화면을 다시 그린다.
  };

  const inputClass =
    'w-full bg-[#f8fafc] dark:bg-[#151c27] border rounded-[10px] px-4 py-3 text-[15px] text-[#1e293b] dark:text-[#dce3f3] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]';

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex items-center justify-center px-4">
      <div className="w-full max-w-[360px]">
        <p className="text-center text-[11px] font-bold tracking-[0.1em] uppercase text-[#0ea5e9] dark:text-[#8ecdff] mb-3">
          운영자 전용
        </p>
        <h1 className="text-center font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[28px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.5px] mb-2">
          NARSHA 대시보드
        </h1>
        <p className="text-center text-[13px] text-[#94a3b8] mb-8">
          운영자 계정으로 로그인하세요.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(false); }}
            placeholder="이메일"
            autoComplete="username"
            autoFocus
            className={`${inputClass} border-[#e2e8f0] dark:border-[#232a36]`}
          />
          <div>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false); }}
              placeholder="비밀번호"
              autoComplete="current-password"
              className={`${inputClass} ${error ? 'border-[#ef4444] ring-1 ring-[#ef4444]/40' : 'border-[#e2e8f0] dark:border-[#232a36]'}`}
            />
            {error && (
              <p className="mt-1.5 text-[13px] text-[#ef4444]">
                이메일 또는 비밀번호가 올바르지 않아요.
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] font-['Manrope:Bold',sans-serif] font-bold text-[15px] py-3 rounded-[10px] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {busy ? '확인 중…' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}

/** 로그인은 됐지만 운영자 역할이 아닌 계정. */
function NotAdmin({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex items-center justify-center px-4">
      <div className="w-full max-w-[360px] text-center">
        <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[22px] text-[#1e293b] dark:text-[#dce3f3] mb-2">
          운영자 권한이 없습니다
        </h1>
        <p className="text-[14px] text-[#94a3b8] mb-6">
          이 계정에는 대시보드 접근 권한이 없어요.
        </p>
        <button
          onClick={onSignOut}
          className="text-[14px] text-[#1b99dc] font-bold hover:underline"
        >
          다른 계정으로 로그인
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  // 권한 판정은 서버에 저장된 역할로 한다 — 화면 상태나 localStorage 로는 하지 않는다.
  const { loading: authLoading, session, profile } = useDeskAuth();
  const authed = Boolean(session) && profile?.role === 'admin';

  const [boostItems, setBoostItems] = useState<BoostSuggestion[]>([]);
  const [accuracyItems, setAccuracyItems] = useState<AccuracyCheck[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [boost, accuracy] = await Promise.all([
        getBoostSuggestions(),
        getAccuracyChecks(),
      ]);
      setBoostItems(boost);
      setAccuracyItems(accuracy);
    } catch {
      toast.error('Failed to load alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (authed) load(); }, [authed]);

  const logout = () => { void supabase.auth.signOut(); };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex items-center justify-center" aria-busy="true">
        <div className="h-8 w-8 rounded-full border-2 border-[#8ecdff] border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!session) return <AdminLogin />;
  if (profile?.role !== 'admin') return <NotAdmin onSignOut={logout} />;

  const totalAlerts = boostItems.length + accuracyItems.length;

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-[800px] mx-auto px-6 py-12">
          <div className="mb-10">
            <div className="flex items-start justify-between mb-1">
              <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#0ea5e9] dark:text-[#8ecdff]">
                운영자 전용
              </p>
              <div className="flex items-center gap-4">
                <Link
                  to={`/${import.meta.env.VITE_ADMIN_PATH || 'admin'}/desk`}
                  className="text-[12px] text-[#1b99dc] hover:underline"
                >
                  나의 한국어 책상 운영 →
                </Link>
                <button
                  onClick={logout}
                className="text-[12px] text-[#94a3b8] dark:text-[#3f4850] hover:text-[#64748b] dark:hover:text-[#8a94a6] transition-colors"
              >
                  로그아웃
                </button>
              </div>
            </div>
            <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[36px] leading-tight text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.8px]">
              태그 검토 대시보드
            </h1>
            <p className="text-[15px] text-[#64748b] dark:text-[#bec7d2] mt-2">
              임계치 — 보강 제안: 리뷰 {ALERT_THRESHOLDS.boostSuggestion.minReviews}개↑ &amp; {ALERT_THRESHOLDS.boostSuggestion.minSupporterPct}%↑ &nbsp;·&nbsp;
              정확성 검토: 리뷰 {ALERT_THRESHOLDS.accuracyCheck.minReviews}개↑ &amp; {ALERT_THRESHOLDS.accuracyCheck.maxSupporterPct}%↓
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : totalAlerts === 0 ? (
            <div className="text-center py-24">
              <p className="text-[40px] mb-4">✅</p>
              <p className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] text-[#1e293b] dark:text-[#dce3f3] mb-2">
                현재 검토할 알림이 없어요
              </p>
              <p className="text-[14px] text-[#64748b] dark:text-[#bec7d2]">
                임계치를 넘는 태그 패턴이 발견되면 여기에 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Boost suggestions */}
              {boostItems.length > 0 && (
                <section>
                  <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[20px] text-[#1e293b] dark:text-[#dce3f3] mb-4">
                    📢 보강 제안 <span className="text-[#0ea5e9] dark:text-[#8ecdff]">{boostItems.length}</span>
                  </h2>
                  <div className="space-y-3">
                    {boostItems.map(item => (
                      <BoostCard key={`${item.appId}-${item.suggestedTag}`} item={item} onAction={load} />
                    ))}
                  </div>
                </section>
              )}

              {/* Accuracy checks */}
              {accuracyItems.length > 0 && (
                <section>
                  <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[20px] text-[#1e293b] dark:text-[#dce3f3] mb-4">
                    ⚠️ 정확성 검토 <span className="text-[#f59e0b]">{accuracyItems.length}</span>
                  </h2>
                  <div className="space-y-3">
                    {accuracyItems.map(item => (
                      <AccuracyCard key={`${item.appId}-${item.currentTag}`} item={item} onAction={load} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
