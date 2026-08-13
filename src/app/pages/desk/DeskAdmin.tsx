import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import DeskShell from './_DeskShell';
import { useLang } from '../../lib/useLang';
import { useDeskAuth } from '../../../features/desk/auth/useDeskAuth';
import { supabase } from '../../../lib/supabase';
import {
  adminCreateInvite, adminListInvites, adminRevokeInvite,
  type CreatedInvite, type InviteRow,
} from '../../../features/desk/api/invites';
import { adminListAllPosts, adminSetHidden } from '../../../features/desk/api/posts';
import type { DeskParticipantType, DeskPost } from '../../../features/desk/types';

const inputClass = "rounded-[10px] border border-[#e2e8f0] dark:border-[#232a36] bg-transparent px-3 py-2 text-[14px] text-[#1e293b] dark:text-[#dce3f3] outline-none focus:border-[#8ecdff]";

export default function DeskAdmin() {
  const [lang] = useLang();
  const { loading, session, profile } = useDeskAuth();

  if (loading) {
    return <DeskShell width="narrow"><div className="py-24 flex justify-center"><div className="h-8 w-8 rounded-full border-2 border-[#8ecdff] border-t-transparent animate-spin" /></div></DeskShell>;
  }
  if (!session) return <AdminLogin lang={lang} />;
  if (profile?.role !== 'admin') {
    return <DeskShell width="narrow"><div className="py-24 text-center text-[15px] text-[#94a3b8]">{lang === 'ko' ? '운영자 권한이 없습니다.' : 'Admin access required.'}</div></DeskShell>;
  }
  return <AdminPanel lang={lang} />;
}

function AdminLogin({ lang }: { lang: 'ko' | 'en' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) toast.error(lang === 'ko' ? '로그인 실패' : 'Login failed');
  };
  return (
    <DeskShell width="narrow">
      <div className="max-w-[360px] mx-auto py-16">
        <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[22px] text-[#1e293b] dark:text-[#dce3f3] mb-1">{lang === 'ko' ? '운영자 로그인' : 'Admin login'}</h1>
        <p className="text-[13px] text-[#94a3b8] mb-6">{lang === 'ko' ? 'Supabase Auth 운영자 계정이 필요합니다.' : 'Requires a Supabase Auth admin account.'}</p>
        <form onSubmit={submit} className="space-y-3">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} w-full`} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} w-full`} />
          <button disabled={busy} className="w-full bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-extrabold text-[15px] py-2.5 rounded-[10px] disabled:opacity-50">{busy ? '…' : (lang === 'ko' ? '로그인' : 'Log in')}</button>
        </form>
      </div>
    </DeskShell>
  );
}

const STATUS_LABEL: Record<string, { ko: string; en: string }> = {
  active: { ko: '미사용', en: 'Active' }, used: { ko: '사용됨', en: 'Used' },
  expired: { ko: '만료', en: 'Expired' }, revoked: { ko: '회수', en: 'Revoked' },
};

function AdminPanel({ lang }: { lang: 'ko' | 'en' }) {
  const { signOut } = useDeskAuth();
  const [label, setLabel] = useState('');
  const [ptype, setPtype] = useState<DeskParticipantType>('co_creator');
  const [days, setDays] = useState(30);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<CreatedInvite | null>(null);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [posts, setPosts] = useState<DeskPost[]>([]);

  const reloadInvites = () => { adminListInvites().then(setInvites).catch(() => {}); };
  const reloadPosts = () => { adminListAllPosts().then(setPosts).catch(() => {}); };
  useEffect(() => { reloadInvites(); reloadPosts(); }, []);

  const create = async () => {
    if (!label.trim() || creating) return;
    setCreating(true);
    try {
      const res = await adminCreateInvite({ label: label.trim(), participantType: ptype, expiresInDays: days });
      setCreated(res);
      setLabel('');
      reloadInvites();
    } catch (e) {
      // 원인 코드를 함께 보여준다 — '발급 실패'만 뜨면 무엇을 고쳐야 할지 알 수 없다.
      const code = e instanceof Error ? e.message : 'UNKNOWN';
      toast.error((lang === 'ko' ? '발급 실패' : 'Create failed') + ` (${code})`);
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (id: string) => {
    try { await adminRevokeInvite(id); reloadInvites(); } catch { toast.error('revoke failed'); }
  };

  const copy = (text: string) => { navigator.clipboard?.writeText(text); toast.success(lang === 'ko' ? '복사됨' : 'Copied'); };

  const hide = async (p: DeskPost) => {
    const reason = window.prompt(lang === 'ko' ? '숨김 사유(선택)' : 'Hide reason (optional)') ?? undefined;
    await adminSetHidden(p.id, true, reason);
    reloadPosts();
  };
  const unhide = async (p: DeskPost) => { await adminSetHidden(p.id, false); reloadPosts(); };

  return (
    <DeskShell width="narrow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[24px] text-[#1e293b] dark:text-[#dce3f3]">{lang === 'ko' ? '나의 한국어 책상 · 운영' : 'Korean Desks · Admin'}</h1>
        <button onClick={() => void signOut()} className="text-[13px] text-[#94a3b8] hover:text-[#64748b]">{lang === 'ko' ? '로그아웃' : 'Log out'}</button>
      </div>

      {/* 초대코드 발급 */}
      <section className="mb-10">
        <h2 className="font-bold text-[16px] text-[#1e293b] dark:text-[#dce3f3] mb-3">{lang === 'ko' ? '초대코드 발급' : 'Issue invite code'}</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <input placeholder={lang === 'ko' ? '라벨 (예: Jakarta #2)' : 'Label'} value={label} onChange={(e) => setLabel(e.target.value)} className={`${inputClass} flex-1 min-w-[160px]`} />
          <select value={ptype} onChange={(e) => setPtype(e.target.value as DeskParticipantType)} className={inputClass}>
            <option value="co_creator">{lang === 'ko' ? '공동제작자' : 'Co-creator'}</option>
            <option value="creator_partner">{lang === 'ko' ? '파트너' : 'Partner'}</option>
          </select>
          {/* 숫자만 있으면 무슨 값인지 알 수 없다 — 라벨을 눈에 보이게 붙인다 */}
          <label className="flex items-center gap-1.5 text-[13px] text-[#64748b] dark:text-[#bec7d2]">
            <input
              type="number" min={1} max={365} value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className={`${inputClass} w-20`}
            />
            {lang === 'ko' ? '일 후 만료' : 'days to expire'}
          </label>
          <button onClick={create} disabled={creating || !label.trim()} className="bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-extrabold text-[14px] px-5 py-2 rounded-[10px] disabled:opacity-50">{lang === 'ko' ? '발급' : 'Create'}</button>
        </div>

        {created && (
          <div className="mt-4 rounded-[12px] border-2 border-[#8ecdff] bg-[#e0f2fe] dark:bg-[#1b5a7a]/30 p-4">
            <p className="text-[12px] font-bold text-[#dc2626] mb-2">⚠️ {lang === 'ko' ? '이 코드는 지금 한 번만 보입니다. 반드시 복사해 두세요.' : 'This code is shown only once. Copy it now.'}</p>

            {/* 코드는 링크 안에 이미 들어 있다. 확인용으로만 보여주고 복사는 문안 하나로 통일한다. */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-[11px] text-[#64748b] dark:text-[#8ecdff] shrink-0">{lang === 'ko' ? '코드' : 'Code'}</span>
              <span className="font-mono text-[13px] font-bold text-[#1e293b] dark:text-[#dce3f3] break-all select-all">{created.code}</span>
            </div>

            {/* 한국어 문단 → 빈 줄 → 영어 문단. 이 블록 전체가 복사 대상이다. */}
            <div className="rounded-[10px] bg-white dark:bg-[#0c141f] border border-[#8ecdff]/60 dark:border-[#232a36] p-3 text-[12px] leading-[1.6] text-[#1e293b] dark:text-[#dce3f3] whitespace-pre-wrap break-words">
              {inviteMessage(created)}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => copy(inviteMessage(created))}
                className="bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-extrabold text-[13px] px-4 py-2 rounded-[10px]"
              >
                {lang === 'ko' ? '전달 문안 복사 (한 + 영)' : 'Copy message (KO + EN)'}
              </button>
              <button onClick={() => setCreated(null)} className="text-[12px] text-[#64748b]">{lang === 'ko' ? '닫기' : 'Close'}</button>
            </div>
          </div>
        )}

        {/* 목록 */}
        <ul className="mt-5 space-y-1.5">
          {invites.map((iv) => (
            <li key={iv.id} className="flex items-center gap-3 text-[13px] rounded-lg border border-[#e2e8f0] dark:border-[#232a36] px-3 py-2">
              <span className="flex-1 min-w-0 truncate text-[#1e293b] dark:text-[#dce3f3]">{iv.label || '—'}</span>
              <span className="text-[#94a3b8]">{iv.participant_type === 'creator_partner' ? (lang === 'ko' ? '파트너' : 'Partner') : ''}</span>
              <span className={iv.status === 'active' ? 'text-[#16a34a]' : 'text-[#94a3b8]'}>{STATUS_LABEL[iv.status]?.[lang]}</span>
              {iv.profiles && <span className="text-[#64748b]">@{iv.profiles.handle}</span>}
              {iv.status === 'active' && <button onClick={() => revoke(iv.id)} className="text-[#dc2626] hover:underline">{lang === 'ko' ? '회수' : 'Revoke'}</button>}
            </li>
          ))}
        </ul>
      </section>

      {/* 글 관리 */}
      <section className="pt-8 border-t border-[#e2e8f0] dark:border-[#232a36]">
        <h2 className="font-bold text-[16px] text-[#1e293b] dark:text-[#dce3f3] mb-3">{lang === 'ko' ? '발행 글 관리' : 'Published posts'}</h2>
        <ul className="space-y-1.5">
          {posts.map((p) => (
            <li key={p.id} className="flex items-center gap-3 text-[13px] rounded-lg border border-[#e2e8f0] dark:border-[#232a36] px-3 py-2">
              <span className="flex-1 min-w-0 truncate text-[#1e293b] dark:text-[#dce3f3]">{p.title || '—'}</span>
              {p.is_hidden
                ? <><span className="text-[#dc2626]">{lang === 'ko' ? '숨김' : 'Hidden'}</span><button onClick={() => unhide(p)} className="text-[#1b99dc] hover:underline">{lang === 'ko' ? '복구' : 'Unhide'}</button></>
                : <button onClick={() => hide(p)} className="text-[#dc2626] hover:underline">{lang === 'ko' ? '강제 숨김' : 'Hide'}</button>}
            </li>
          ))}
          {posts.length === 0 && <li className="text-[13px] text-[#94a3b8] py-4 text-center">{lang === 'ko' ? '발행된 글이 없습니다.' : 'No published posts.'}</li>}
        </ul>
      </section>
    </DeskShell>
  );
}

/**
 * 저자에게 그대로 붙여 보낼 안내 문안 — 한국어 문단, 빈 줄, 영어 문단.
 * 링크에 코드가 들어 있어 코드·링크를 따로 복사할 필요가 없다.
 */
function inviteMessage(created: { message_ko: string; message_en: string }): string {
  return `${created.message_ko}\n\n${created.message_en}`;
}
