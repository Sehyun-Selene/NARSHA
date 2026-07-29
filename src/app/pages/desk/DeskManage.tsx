import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import DeskShell from './_DeskShell';
import { useLang } from '../../lib/useLang';
import { useDeskAuth } from '../../../features/desk/auth/useDeskAuth';
import { listMyPosts, setPostStatus, deletePost } from '../../../features/desk/api/posts';
import { getQuota, ACCOUNT_QUOTA_BYTES } from '../../../features/desk/api/media';
import type { DeskPost } from '../../../features/desk/types';

function mb(bytes: number) { return (bytes / 1024 / 1024).toFixed(1); }

export default function DeskManage() {
  const [lang] = useLang();
  const { profile } = useDeskAuth();
  const [tab, setTab] = useState<'published' | 'draft'>('published');
  const [posts, setPosts] = useState<DeskPost[] | null>(null);
  const [quota, setQuota] = useState<{ used: number } | null>(null);

  const reload = () => { listMyPosts().then(setPosts).catch(() => setPosts([])); };
  useEffect(() => { reload(); getQuota().then((q) => setQuota({ used: q.used })).catch(() => {}); }, []);

  const t = lang === 'ko' ? {
    title: '내 글 관리', published: '발행', draft: '임시저장', views: '조회', edit: '수정',
    unpublish: '비공개로', del: '삭제', empty: '글이 없어요.', storage: '저장 공간',
    confirmDel: '정말 삭제할까요? 되돌릴 수 없어요.',
  } : {
    title: 'Manage', published: 'Published', draft: 'Drafts', views: 'views', edit: 'Edit',
    unpublish: 'Make private', del: 'Delete', empty: 'No posts.', storage: 'Storage',
    confirmDel: 'Delete permanently? This cannot be undone.',
  };

  const list = (posts ?? []).filter((p) => (tab === 'published' ? p.status === 'published' : p.status !== 'published'));

  const unpublish = async (id: string) => { await setPostStatus(id, 'draft'); toast.success(t.unpublish); reload(); };
  const remove = async (id: string) => { if (!confirm(t.confirmDel)) return; await deletePost(id); toast.success(t.del); reload(); };

  return (
    <DeskShell width="narrow">
      <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[24px] text-[#1e293b] dark:text-[#dce3f3] mb-4">{t.title}</h1>

      {/* 스토리지 게이지 */}
      {quota && (
        <div className="mb-6">
          <div className="flex justify-between text-[12px] text-[#64748b] dark:text-[#bec7d2] mb-1">
            <span>{t.storage}</span>
            <span>{mb(quota.used)} / {mb(ACCOUNT_QUOTA_BYTES)} MB</span>
          </div>
          <div className="h-2 rounded-full bg-[#f1f5f9] dark:bg-[#232a36] overflow-hidden">
            <div className="h-full bg-[#8ecdff]" style={{ width: `${Math.min(100, (quota.used / ACCOUNT_QUOTA_BYTES) * 100)}%` }} />
          </div>
        </div>
      )}

      {/* 탭 */}
      <div className="flex gap-2 mb-4 border-b border-[#e2e8f0] dark:border-[#232a36]">
        {(['published', 'draft'] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 text-[14px] -mb-px border-b-2 ${tab === k ? 'border-[#1b99dc] text-[#1b99dc] font-bold' : 'border-transparent text-[#64748b] dark:text-[#bec7d2]'}`}>
            {t[k]}
          </button>
        ))}
      </div>

      {posts === null ? (
        <div className="py-16 flex justify-center"><div className="h-6 w-6 rounded-full border-2 border-[#8ecdff] border-t-transparent animate-spin" /></div>
      ) : list.length === 0 ? (
        <p className="py-16 text-center text-[14px] text-[#94a3b8]">{t.empty}</p>
      ) : (
        <ul className="space-y-2">
          {list.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-lg border border-[#e2e8f0] dark:border-[#232a36] px-4 py-3">
              <span className="flex-1 min-w-0">
                <span className="block text-[15px] text-[#1e293b] dark:text-[#dce3f3] truncate">{p.title || (lang === 'ko' ? '(제목 없음)' : '(untitled)')}</span>
                <span className="block text-[12px] text-[#94a3b8]">
                  {new Date(p.updated_at).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US')}
                  {p.status === 'published' && ` · ${p.view_count} ${t.views}`}
                  {p.status === 'published' && profile && (
                    <> · <Link to={`/desk/@${profile.handle}/${p.slug}`} className="text-[#8ecdff] hover:underline">/{p.slug}</Link></>
                  )}
                </span>
              </span>
              <Link to={`/desk/write/${p.id}`} className="text-[13px] text-[#1b99dc] hover:underline">{t.edit}</Link>
              {p.status === 'published' && <button onClick={() => unpublish(p.id)} className="text-[13px] text-[#64748b] dark:text-[#bec7d2] hover:underline">{t.unpublish}</button>}
              <button onClick={() => remove(p.id)} className="text-[13px] text-[#dc2626] hover:underline">{t.del}</button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <Link to="/desk/write" className="text-[14px] text-[#1b99dc] hover:underline">
          {lang === 'ko' ? '+ 새 글 쓰기' : '+ New post'}
        </Link>
      </div>
    </DeskShell>
  );
}
