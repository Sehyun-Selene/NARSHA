import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useT, tNow } from '../i18n';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useMemberAuth } from '../../features/auth/useMemberAuth';
import MemberAuthModal from '../../features/auth/MemberAuthModal';
import {
  getMyReviews,
  updateMyReview,
  deleteMyReview,
  type Review,
} from '../data/reviews';
import { fetchApps, appName, type App } from '../data/apps';

/**
 * 내 후기 (GNB PRD REQ-C / C-4).
 *
 * 로그인 회원이 자기 이름으로 쓴 후기만 나온다. 닉네임으로 쓴 익명 후기는
 * 작성자를 증명할 방법이 없어 여기에 넣을 수 없다 — 화면에 그 이유를 밝힌다.
 * (RLS 도 `author_id = auth.uid()` 로만 수정·삭제를 허용한다.)
 */

const CONTENT_MIN = 20;
const CONTENT_MAX = 2000;

export default function MyReviews() {
  const { t, lang } = useT();
  useDocumentTitle('my.title');
  const { loading: authLoading, session } = useMemberAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [appMap, setAppMap] = useState<Map<string, App>>(new Map());
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [draftRating, setDraftRating] = useState(0);
  const [busy, setBusy] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (authLoading || !session) {
      if (!authLoading) setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const [mine, apps] = await Promise.all([getMyReviews(session.user.id), fetchApps()]);
        if (!active) return;
        setReviews(mine);
        setAppMap(new Map(apps.map(a => [a.id, a])));
      } catch (e) {
        const code = e instanceof Error ? e.message : 'UNKNOWN';
        toast.error(`${tNow('member.err.UNKNOWN')} (${code})`);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
    // ⚠️ `t` 를 의존성에 넣으면 안 된다 — useT() 가 렌더마다 새 함수를 만들기 때문에
    // 매 렌더 effect 가 다시 돌고, setLoading(true) → 재렌더 → 재실행으로
    // 스피너가 끝없이 깜빡인다. 에러 문구는 훅 밖에서 쓰는 tNow() 로 얻는다.
  }, [authLoading, session]);

  const startEdit = (r: Review) => {
    setEditingId(r.id);
    setDraft(r.content);
    setDraftRating(r.rating);
  };

  const save = async (id: string) => {
    const body = draft.trim();
    if (body.length < CONTENT_MIN) { toast.error(t('review.err.contentMin')); return; }
    if (body.length > CONTENT_MAX) { toast.error(t('review.err.contentMax')); return; }
    if (draftRating < 1) { toast.error(t('review.err.rating')); return; }

    setBusy(true);
    try {
      await updateMyReview(id, { content: body, rating: draftRating });
      setReviews(prev => prev.map(r => (r.id === id ? { ...r, content: body, rating: draftRating } : r)));
      setEditingId(null);
      toast.success(t('my.saved'));
    } catch (e) {
      const code = e instanceof Error ? e.message : 'UNKNOWN';
      toast.error(`${t('member.err.UNKNOWN')} (${code})`);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm(t('my.deleteConfirm'))) return;
    setBusy(true);
    try {
      await deleteMyReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success(t('my.deleted'));
    } catch (e) {
      const code = e instanceof Error ? e.message : 'UNKNOWN';
      toast.error(`${t('member.err.UNKNOWN')} (${code})`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-12">
          <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[32px] text-[#1e293b] dark:text-[#dce3f3] mb-2">
            {t('my.title')}
          </h1>
          <p className="text-[13px] text-[#94a3b8] dark:text-[#8a94a6] mb-8">{t('my.anonNote')}</p>

          {authLoading || loading ? (
            <div className="flex justify-center py-24" aria-busy="true">
              <div className="w-8 h-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !session ? (
            <div className="text-center py-20">
              <p className="text-[15px] text-[#64748b] dark:text-[#bec7d2] mb-5">{t('my.loginNeeded')}</p>
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-extrabold text-[14px] px-6 py-2.5 rounded-[10px]"
              >
                {t('member.login')}
              </button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-['Manrope:Bold',sans-serif] font-bold text-[17px] text-[#1e293b] dark:text-[#dce3f3] mb-2">
                {t('my.empty')}
              </p>
              <p className="text-[14px] text-[#64748b] dark:text-[#bec7d2] mb-5">{t('my.emptyHint')}</p>
              <Link to="/" className="text-[14px] font-bold text-[#1b99dc] hover:underline">
                {t('my.browse')}
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {reviews.map(r => {
                const app = appMap.get(r.appId);
                const editing = editingId === r.id;
                return (
                  <li key={r.id} className="rounded-[16px] border border-[#e2e8f0] dark:border-[#232a36] p-5">
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                      <Link to={`/apps/${r.appId}`} className="font-bold text-[15px] text-[#1e293b] dark:text-[#dce3f3] hover:underline">
                        {app ? appName(app, lang) : r.appId}
                      </Link>
                      <span className="text-[12px] text-[#94a3b8]">
                        {r.createdAt.toLocaleDateString()}
                      </span>
                    </div>

                    {editing ? (
                      <>
                        <div className="flex gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setDraftRating(n)}
                              aria-label={`${n}`}
                              className="p-0.5"
                            >
                              <Star className={`w-5 h-5 ${n <= draftRating ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-[#cbd5e1]'}`} />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={draft}
                          onChange={e => setDraft(e.target.value.slice(0, CONTENT_MAX))}
                          rows={5}
                          className="w-full bg-[#f8fafc] dark:bg-[#0c141f] border border-[#e2e8f0] dark:border-[#232a36] rounded-[8px] px-3 py-2 text-[14px] text-[#1e293b] dark:text-[#dce3f3] resize-none focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                        />
                        <p className="mt-1 text-right text-[11px] text-[#94a3b8]">{draft.length}/{CONTENT_MAX}</p>
                        <div className="mt-2 flex gap-3">
                          <button
                            type="button"
                            onClick={() => void save(r.id)}
                            disabled={busy}
                            className="text-[13px] font-bold text-[#1b99dc] hover:underline disabled:opacity-50"
                          >
                            {t('my.save')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-[13px] text-[#64748b] hover:underline"
                          >
                            {t('my.cancel')}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex gap-0.5 mb-2" aria-label={`${r.rating}`}>
                          {[1, 2, 3, 4, 5].map(n => (
                            <Star key={n} className={`w-4 h-4 ${n <= r.rating ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-[#cbd5e1]'}`} />
                          ))}
                        </div>
                        <p className="text-[14px] leading-[1.7] text-[#64748b] dark:text-[#bec7d2] whitespace-pre-wrap break-words">
                          {r.content}
                        </p>
                        <div className="mt-3 flex gap-3">
                          <button type="button" onClick={() => startEdit(r)} className="text-[13px] text-[#1b99dc] hover:underline">
                            {t('my.edit')}
                          </button>
                          <button
                            type="button"
                            onClick={() => void remove(r.id)}
                            disabled={busy}
                            className="text-[13px] text-[#dc2626] hover:underline disabled:opacity-50"
                          >
                            {t('my.delete')}
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
      <Footer />

      <MemberAuthModal open={authOpen} mode="login" onClose={() => setAuthOpen(false)} />
    </div>
  );
}

