import { useEffect, useState } from 'react';
import DeskShell from './_DeskShell';
import { useLang } from '../../lib/useLang';
import LoginForm from '../../../features/desk/auth/LoginForm';
import { introCopy, DESK_TITLE } from '../../../features/desk/components/introCopy';
import { countActiveAuthors } from '../../../features/desk/api/profiles';

export default function DeskLogin() {
  const [lang] = useLang();
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    countActiveAuthors().then((c) => active && setN(c)).catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <DeskShell width="narrow">
      <div className="max-w-[440px] mx-auto py-8">
        {/* §3.2 확정 소개 문안 */}
        <p className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] tracking-[0.08em] uppercase text-[#8ecdff] mb-2">
          {DESK_TITLE[lang]}
        </p>
        <p className="font-['Inter:Regular',sans-serif] text-[15px] leading-[1.8] text-[#1e293b] dark:text-[#dce3f3] mb-8">
          {introCopy(n, lang)}
        </p>

        <div className="rounded-[16px] border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#151c27] p-6">
          <LoginForm />
        </div>
      </div>
    </DeskShell>
  );
}
