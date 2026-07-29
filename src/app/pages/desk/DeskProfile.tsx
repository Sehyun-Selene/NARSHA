import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import DeskShell, { DeskStub } from './_DeskShell';
import { useLang } from '../../lib/useLang';
import PartnerBadge from '../../../features/desk/components/PartnerBadge';
import { getProfileByHandle } from '../../../features/desk/api/profiles';
import { getFeed } from '../../../features/desk/api/posts';
import type { DeskFeedItem, Profile } from '../../../features/desk/types';
import { COUNTRY_LABEL } from '../../../features/desk/types';

export default function DeskProfile() {
  const [lang] = useLang();
  const { handleParam } = useParams();
  const valid = !!handleParam && handleParam.startsWith('@');
  const handle = valid ? handleParam!.slice(1) : '';

  const [state, setState] = useState<'loading' | 'notfound' | 'ready'>('loading');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<DeskFeedItem[]>([]);

  useEffect(() => {
    if (!valid) {
      setState('notfound');
      return;
    }
    let active = true;
    setState('loading');
    getProfileByHandle(handle)
      .then(async (p) => {
        if (!active) return;
        if (!p) {
          setState('notfound');
          return;
        }
        setProfile(p);
        const page = await getFeed({ handle }, null);
        if (!active) return;
        setPosts(page.items);
        setState('ready');
      })
      .catch(() => active && setState('notfound'));
    return () => {
      active = false;
    };
  }, [handle, valid]);

  if (state === 'loading') {
    return (
      <DeskShell>
        <div className="py-24 flex justify-center" aria-busy="true">
          <div className="h-8 w-8 rounded-full border-2 border-[#8ecdff] border-t-transparent animate-spin" />
        </div>
      </DeskShell>
    );
  }

  if (state === 'notfound' || !profile) {
    return (
      <DeskShell width="narrow">
        <DeskStub
          title={lang === 'ko' ? '책상을 찾을 수 없습니다' : 'Desk not found'}
          note={lang === 'ko' ? '주소를 다시 확인해 주세요.' : 'Please check the address.'}
        />
        <div className="text-center">
          <Link to="/desk" className="text-[#8ecdff] hover:underline text-[14px]">← {lang === 'ko' ? '전체 피드' : 'Back to feed'}</Link>
        </div>
      </DeskShell>
    );
  }

  const name = lang === 'en' && profile.display_name_en ? profile.display_name_en : profile.display_name;
  const possessive = lang === 'ko' ? `${name}의 한국어 책상` : `${name}'s Korean Desk`;
  const bio = lang === 'en' && profile.bio_en ? profile.bio_en : profile.bio;

  return (
    <DeskShell>
      {/* 프로필 헤더 */}
      <header className="flex flex-col sm:flex-row sm:items-center gap-5 mb-10 pb-8 border-b border-[#e2e8f0] dark:border-[#232a36]">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={name} className="w-20 h-20 rounded-full object-cover border border-[#e2e8f0] dark:border-[#232a36]" />
        ) : (
          <span className="w-20 h-20 rounded-full flex items-center justify-center bg-[#e0f2fe] dark:bg-[#1b5a7a] text-[#0369a1] dark:text-[#8ecdff] font-bold text-[32px]">
            {name.charAt(0)}
          </span>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[26px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.03em]">
              {possessive}
            </h1>
            <PartnerBadge participantType={profile.participant_type} lang={lang} />
          </div>
          <p className="text-[13px] text-[#94a3b8] mt-1">
            @{profile.handle}
            {profile.country && ` · ${COUNTRY_LABEL[profile.country]?.[lang] ?? profile.country}`}
            {profile.city && ` · ${profile.city}`}
          </p>
          {bio && (
            <p className="font-['Inter:Regular',sans-serif] text-[15px] leading-[1.7] text-[#64748b] dark:text-[#bec7d2] mt-3 max-w-[640px]">
              {bio}
            </p>
          )}
          {profile.channel_url && (
            <a
              href={profile.channel_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-block mt-3 text-[13px] text-[#8ecdff] hover:underline"
            >
              {lang === 'ko' ? '채널 바로가기 ↗' : 'Visit channel ↗'}
            </a>
          )}
        </div>
      </header>

      {/* 글 목록 */}
      {posts.length === 0 ? (
        <div className="py-16 text-center text-[15px] text-[#94a3b8]">
          {lang === 'ko' ? '아직 발행한 글이 없습니다.' : 'No posts published yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((item) => (
            <Link
              key={item.id}
              to={`/desk/@${item.handle}/${item.slug}`}
              className="group rounded-[16px] overflow-hidden border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#151c27] hover:shadow-[0px_10px_24px_-8px_rgba(0,0,0,0.12)] transition-shadow flex flex-col"
            >
              <div className="aspect-[16/9] bg-[#f1f5f9] dark:bg-[#0c141f] overflow-hidden">
                {item.cover_url && <img src={item.cover_url} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform" />}
              </div>
              <div className="p-4">
                <h3 className="font-['Manrope:Bold',sans-serif] font-bold text-[15px] leading-snug text-[#1e293b] dark:text-[#dce3f3] line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-[12px] text-[#94a3b8] mt-2">
                  {item.published_at ? new Date(item.published_at).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US') : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DeskShell>
  );
}
