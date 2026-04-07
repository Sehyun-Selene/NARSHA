import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer className="bg-[#f8fafc] dark:bg-[#0c141f] border-t border-[rgba(46,53,65,0.2)] dark:border-[rgba(46,53,65,0.2)] w-full">
      <div className="max-w-[1440px] mx-auto px-8 py-12">
        <div className="flex items-center justify-between">
          <div className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] text-[#1e293b] dark:text-[#8ecdff] leading-[28px]">
            NARSHA
          </div>
          
          <div className="font-['Inter:Regular',sans-serif] font-normal text-[14px] text-[#64748b] dark:text-[#64748b] leading-[20px]">
            © 2024 NARSHA. The Scholarly Architect.
          </div>
          
          <div className="flex gap-6">
            <Link 
              to="/about" 
              className="font-['Inter:Regular',sans-serif] font-normal text-[14px] text-[#64748b] dark:text-[#64748b] hover:text-[#1e293b] dark:hover:text-[#8ecdff] leading-[20px] transition-colors"
            >
              About
            </Link>
            <Link 
              to="/methodology" 
              className="font-['Inter:Regular',sans-serif] font-normal text-[14px] text-[#64748b] dark:text-[#64748b] hover:text-[#1e293b] dark:hover:text-[#8ecdff] leading-[20px] transition-colors"
            >
              Methodology
            </Link>
            <Link 
              to="/privacy" 
              className="font-['Inter:Regular',sans-serif] font-normal text-[14px] text-[#64748b] dark:text-[#64748b] hover:text-[#1e293b] dark:hover:text-[#8ecdff] leading-[20px] transition-colors"
            >
              Privacy
            </Link>
            <Link 
              to="/terms" 
              className="font-['Inter:Regular',sans-serif] font-normal text-[14px] text-[#64748b] dark:text-[#64748b] hover:text-[#1e293b] dark:hover:text-[#8ecdff] leading-[20px] transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
