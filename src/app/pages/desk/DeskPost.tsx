import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import DeskShell, { DeskStub } from './_DeskShell';
import { useLang } from '../../lib/useLang';
import PartnerBadge from '../../../features/desk/components/PartnerBadge';
import DeskContent from '../../../features/desk/render/DeskContent';
import { getPostByHandleSlug, incrementViewOncePerSession } from '../../../features/desk/api/posts';
import type { DeskPost as DeskPostType, Profile } from '../../../features/desk/types';
import { COUNTRY_LABEL } from '../../../features/desk/types';

export default function DeskPost() {
  const [lang] = useLang();
  const { handleParam, slug } = useParams();
  const valid = !!handleParam && handleParam.startsWith('@') && !!slug;
  const handle = valid ? handleParam!.slice(1) : '';

  const [state, setState] = useState<'loading' | 'notfound' | 'ready'>('loading');
  const [post, setPost] = useState<DeskPostType | null>(null);
  const [author, setAuthor] = useState<Profile | null>(null);

  useEffect(() => {
    if (!valid) {
      setState('notfound');
      return;
    }
    let active = true;
    setState('loading');
    getPostByHandleSlug(handle, slug!)
      .then((res) => {
        if (!active) return;
        if (!res) {
          setState('notfound');
          return;
        }
        setPost(res.post);
        setAuthor(res.author);
        setState('ready');
        // 발행본만 조회수 집계
        if (res.post.status === 'published' && !res.post.is_hidden) {
          void incrementViewOncePerSession(res.post.id);
        }
      })
      .catch(() => active && setState('notfound'));
    return () => {
      active = false;
    };
  }, [handle, slug, valid]);

  if (state === 'loading') {
    return (
      <DeskShell width="narrow">
        <div className="py-24 flex justify-center" aria-busy="true">
          <div className="h-8 w-8 rounded-full border-2 border-[#8ecdff] border-t-transparent animate-spin" />
        </div>
      </DeskShell>
    );
  }

  if (state === 'notfound' || !post || !author) {
    return (
      <DeskShell width="narrow">
        <DeskStub
          title={lang === 'ko' ? '글을 찾을 수 없습니다' : 'Post not found'}
          note={lang === 'ko' ? '삭제되었거나 비공개된 글일 수 있습니다.' : 'It may have been removed or made private.'}
        />
        <div className="text-center">
          <Link to="/desk" className="text-[#8ecdff] hover:underline text-[14px]">← {lang === 'ko' ? '전체 피드' : 'Back to feed'}</Link>
        </div>
      </DeskShell>
    );
  }

  const name = lang === 'en' && author.display_name_en ? author.display_name_en : author.display_name;

  return (
    <DeskShell width="narrow">
      <article>
        <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[clamp(1.75rem,3vw,2.25rem)] leading-tight text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.03em] mb-4">
          {post.title}
        </h1>

        {/* 저자 정보 */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#e2e8f0] dark:border-[#232a36]">
          <Link to={`/desk/@${author.handle}`} className="flex items-center gap-2 group">
            {author.avatar_url ? (
              <img src={author.avatar_url} alt={name} className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <span className="w-9 h-9 rounded-full flex items-center justify-center bg-[#e0f2fe] dark:bg-[#1b5a7a] text-[#0369a1] dark:text-[#8ecdff] font-bold text-[15px]">
                {name.charAt(0)}
              </span>
            )}
            <span className="font-['Inter:Medium',sans-serif] text-[14px] text-[#1e293b] dark:text-[#dce3f3] group-hover:text-[#1b99dc]">
              {name}
            </span>
          </Link>
          <PartnerBadge participantType={author.participant_type} lang={lang} />
          <span className="text-[13px] text-[#94a3b8] ml-auto">
            {author.country && `${COUNTRY_LABEL[author.country]?.[lang] ?? author.country} · `}
            {post.published_at ? new Date(post.published_at).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US') : ''}
          </span>
        </div>

        {post.cover_url && (
          <img src={post.cover_url} alt="" className="w-full rounded-[16px] mb-8 object-cover" loading="lazy" />
        )}

        {/* 본문 — DOMPurify 정화 후 렌더 */}
        <DeskContent html={post.content_html} />

        {/* 태그 */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-[#e2e8f0] dark:border-[#232a36]">
            {post.tags.map((tg) => (
              <Link
                key={tg}
                to={`/desk?tag=${encodeURIComponent(tg)}`}
                className="px-3 py-1 rounded-full bg-[#f1f5f9] dark:bg-[#1e293b] text-[13px] text-[#64748b] dark:text-[#bec7d2] hover:bg-[#e2e8f0] dark:hover:bg-[#334155]"
              >
                #{tg}
              </Link>
            ))}
          </div>
        )}
      </article>
    </DeskShell>
  );
}
