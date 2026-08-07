import { Link } from 'react-router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useT } from '../i18n';

export default function NotFound() {
  const { t } = useT();

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16 flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[120px] leading-none text-[transparent] bg-clip-text bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] mb-4">
            404
          </h1>
          
          <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[36px] text-[#1e293b] dark:text-[#dce3f3] mb-4">
            {t('notfound.title')}
          </h2>

          <p className="font-['Inter:Regular',sans-serif] font-normal text-[18px] text-[#64748b] dark:text-[#bec7d2] mb-8">
            {t('notfound.body')}
          </p>
          
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[16px] px-8 py-4 rounded-[8px] hover:opacity-90 transition-opacity shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]"
          >
            {t('notfound.back')}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
