import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DeskShell from './_DeskShell';
import { useLang } from '../../lib/useLang';
import { useDeskAuth } from '../../../features/desk/auth/useDeskAuth';
import { supabase } from '../../../lib/supabase';
import { validateHandleClient, isHandleAvailable } from '../../../features/desk/auth/handle';
import { deskErrorMessage } from '../../../features/desk/auth/deskErrors';
import { isPartner } from '../../../features/desk/types';

const inputClass = "w-full rounded-[10px] border border-[#e2e8f0] dark:border-[#232a36] bg-transparent px-3 py-2 text-[14px] text-[#1e293b] dark:text-[#dce3f3] outline-none focus:border-[#8ecdff]";
const label = "block text-[13px] font-medium text-[#64748b] dark:text-[#bec7d2] mb-1.5";

export default function DeskSettings() {
  const [lang] = useLang();
  const { profile, refreshProfile } = useDeskAuth();

  const [displayName, setDisplayName] = useState('');
  const [displayNameEn, setDisplayNameEn] = useState('');
  const [country, setCountry] = useState<'ID' | 'PH' | ''>('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [handle, setHandle] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? '');
    setDisplayNameEn(profile.display_name_en ?? '');
    setCountry((profile.country as 'ID' | 'PH') ?? '');
    setCity(profile.city ?? '');
    setBio(profile.bio ?? '');
    setBioEn(profile.bio_en ?? '');
    setChannelUrl(profile.channel_url ?? '');
    setHandle(profile.handle ?? '');
  }, [profile]);

  const t = lang === 'ko' ? {
    title: '설정', profile: '프로필', displayName: '표시 이름', displayNameEn: '표시 이름 (영문)',
    country: '국가', city: '도시', bio: '한 줄 소개', bioEn: '한 줄 소개 (영문)', channel: '채널 링크',
    handle: '책상 주소 (handle)', handleLocked: 'handle 은 1회만 변경할 수 있어 이미 변경 완료되었습니다.',
    save: '저장', saving: '저장 중…', pw: '비밀번호 변경', newPw: '새 비밀번호 (8자 이상)', changePw: '변경',
    deactivate: '계정 비활성화', deactivateNote: '계정 비활성화·삭제는 나르샤 팀에 요청해 주세요. 글 처리 방식(유지·삭제)을 함께 안내드립니다.',
    saved: '저장되었습니다.', idn: '인도네시아', phl: '필리핀',
  } : {
    title: 'Settings', profile: 'Profile', displayName: 'Display name', displayNameEn: 'Display name (English)',
    country: 'Country', city: 'City', bio: 'One-line bio', bioEn: 'One-line bio (English)', channel: 'Channel link',
    handle: 'Desk address (handle)', handleLocked: 'Handle can be changed only once and has already been changed.',
    save: 'Save', saving: 'Saving…', pw: 'Change password', newPw: 'New password (8+ chars)', changePw: 'Change',
    deactivate: 'Deactivate account', deactivateNote: 'Please contact the NARSHA team to deactivate or delete your account. They will guide you on how your posts are handled.',
    saved: 'Saved.', idn: 'Indonesia', phl: 'Philippines',
  };

  const handleLocked = !!profile?.handle_changed_at;

  const saveProfile = async () => {
    if (!profile || savingProfile) return;
    setSavingProfile(true);
    try {
      const patch: Record<string, unknown> = {
        display_name: displayName.trim(),
        display_name_en: displayNameEn.trim() || null,
        country: country || null,
        city: city.trim() || null,
        bio: bio.trim() || null,
        bio_en: bioEn.trim() || null,
        channel_url: channelUrl.trim() || null,
      };
      // handle 변경 (미변경 계정만, 형식·중복 확인)
      if (!handleLocked && handle !== profile.handle) {
        const fmt = validateHandleClient(handle);
        if (fmt) { toast.error(deskErrorMessage(fmt, lang)); setSavingProfile(false); return; }
        if (!(await isHandleAvailable(handle))) { toast.error(deskErrorMessage('HANDLE_TAKEN', lang)); setSavingProfile(false); return; }
        patch.handle = handle;
      }
      const { error } = await supabase.from('profiles').update(patch).eq('id', profile.id);
      if (error) throw error;
      await refreshProfile();
      toast.success(t.saved);
    } catch {
      toast.error(deskErrorMessage('NETWORK', lang));
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 8 || savingPw) { if (newPassword.length < 8) toast.error(deskErrorMessage('PASSWORD_TOO_SHORT', lang)); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPw(false);
    if (error) toast.error(deskErrorMessage('NETWORK', lang));
    else { toast.success(t.saved); setNewPassword(''); }
  };

  return (
    <DeskShell width="narrow">
      <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[24px] text-[#1e293b] dark:text-[#dce3f3] mb-6">{t.title}</h1>

      {/* 프로필 */}
      <section className="space-y-4 mb-10">
        <h2 className="font-bold text-[16px] text-[#1e293b] dark:text-[#dce3f3]">{t.profile}</h2>
        <div><label className={label}>{t.displayName}</label><input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} /></div>
        <div><label className={label}>{t.displayNameEn}</label><input value={displayNameEn} onChange={(e) => setDisplayNameEn(e.target.value)} className={inputClass} /></div>
        <div>
          <label className={label}>{t.country}</label>
          <div className="flex gap-2">
            {(['ID', 'PH'] as const).map((c) => (
              <button key={c} onClick={() => setCountry(c)} className={`px-4 py-2 rounded-full text-[13px] ${country === c ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white' : 'bg-[#f1f5f9] dark:bg-[#232a36] text-[#64748b] dark:text-[#bec7d2]'}`}>
                {c === 'ID' ? t.idn : t.phl}
              </button>
            ))}
          </div>
        </div>
        <div><label className={label}>{t.city}</label><input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} /></div>
        <div><label className={label}>{t.bio}</label><input value={bio} onChange={(e) => setBio(e.target.value)} className={inputClass} /></div>
        <div><label className={label}>{t.bioEn}</label><input value={bioEn} onChange={(e) => setBioEn(e.target.value)} className={inputClass} /></div>
        {profile && isPartner(profile) && (
          <div><label className={label}>{t.channel}</label><input value={channelUrl} onChange={(e) => setChannelUrl(e.target.value)} placeholder="https://" className={inputClass} /></div>
        )}
        <div>
          <label className={label}>{t.handle}</label>
          <div className="flex items-center gap-1">
            <span className="text-[14px] text-[#94a3b8]">/desk/@</span>
            <input value={handle} disabled={handleLocked} onChange={(e) => setHandle(e.target.value.toLowerCase())} className={`${inputClass} flex-1 disabled:opacity-60`} />
          </div>
          {handleLocked && <p className="text-[12px] text-[#94a3b8] mt-1">{t.handleLocked}</p>}
        </div>
        <button onClick={saveProfile} disabled={savingProfile} className="bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[14px] px-6 py-2.5 rounded-[10px] hover:opacity-90 disabled:opacity-50">
          {savingProfile ? t.saving : t.save}
        </button>
      </section>

      {/* 비밀번호 */}
      <section className="space-y-3 mb-10 pt-8 border-t border-[#e2e8f0] dark:border-[#232a36]">
        <h2 className="font-bold text-[16px] text-[#1e293b] dark:text-[#dce3f3]">{t.pw}</h2>
        <div className="flex gap-2">
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t.newPw} className={inputClass} />
          <button onClick={changePassword} disabled={savingPw} className="shrink-0 px-5 py-2 rounded-[10px] border border-[#e2e8f0] dark:border-[#232a36] text-[14px] text-[#1e293b] dark:text-[#dce3f3] disabled:opacity-50">{t.changePw}</button>
        </div>
      </section>

      {/* 비활성화 안내 */}
      <section className="pt-8 border-t border-[#e2e8f0] dark:border-[#232a36]">
        <h2 className="font-bold text-[16px] text-[#1e293b] dark:text-[#dce3f3] mb-2">{t.deactivate}</h2>
        <p className="text-[13px] leading-[1.6] text-[#64748b] dark:text-[#bec7d2]">{t.deactivateNote}</p>
      </section>
    </DeskShell>
  );
}
