import { useState } from 'react';
import { Link } from 'react-router';
import SuggestServiceModal from './SuggestServiceModal';
import { useT } from '../i18n';
import type { StringKey } from '../i18n';

type FooterProps = {
  /** Tighter padding for short pages (e.g. survey intro) so primary CTA stays above the fold. */
  compact?: boolean;
};

const LINKS: { to: string; key: StringKey }[] = [
  { to: '/about',       key: 'footer.about' },
  { to: '/faq',         key: 'footer.faq' },
  { to: '/methodology', key: 'footer.methodology' },
  { to: '/privacy',     key: 'footer.privacy' },
  { to: '/terms',       key: 'footer.terms' },
];

export default function Footer({ compact = false }: FooterProps) {
  const [showModal, setShowModal] = useState(false);
  const { t } = useT();

  return (
    <>
      <footer className="bg-[#f8fafc] dark:bg-[#0c141f] border-t border-[rgba(46,53,65,0.2)] dark:border-[rgba(46,53,65,0.2)] w-full">
        <div
          className={`max-w-[1440px] mx-auto px-4 sm:px-8 ${compact ? 'py-5 sm:py-6' : 'py-12'}`}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] text-[#1e293b] dark:text-[#8ecdff] leading-[28px]">
              NARSHA
            </div>

            <div className="font-['Inter:Regular',sans-serif] font-normal text-[14px] text-[#64748b] dark:text-[#64748b] leading-[20px]">
              {t('footer.tagline')}
            </div>

            <div className="flex gap-6 flex-wrap items-center">
              {LINKS.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="font-['Inter:Regular',sans-serif] font-normal text-[14px] text-[#64748b] dark:text-[#64748b] hover:text-[#1e293b] dark:hover:text-[#8ecdff] leading-[20px] transition-colors"
                >
                  {t(link.key)}
                </Link>
              ))}
              <button
                onClick={() => setShowModal(true)}
                className="font-['Inter:Regular',sans-serif] font-normal text-[14px] text-[#0ea5e9] dark:text-[#8ecdff] hover:opacity-75 leading-[20px] transition-opacity"
              >
                {t('footer.suggest')}
              </button>
            </div>
          </div>
        </div>
      </footer>

      <SuggestServiceModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
