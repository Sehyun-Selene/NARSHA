import { useState, useEffect, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import SuggestServiceModal from './SuggestServiceModal';
import { useT } from '../i18n';

const BUBBLE_SHOWN_KEY = 'narsha-suggest-bubble-shown';

export default function FloatingSuggestButton() {
  const [showBubble, setShowBubble] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // useT 는 언어 변경 이벤트를 구독한다 — getLang() 을 직접 읽으면 헤더에서
  // 언어를 바꿔도 이 버튼만 이전 언어에 머문다.
  const { t } = useT();

  useEffect(() => {
    if (localStorage.getItem(BUBBLE_SHOWN_KEY)) return;
    const showTimer = setTimeout(() => {
      setShowBubble(true);
      const hideTimer = setTimeout(() => {
        setShowBubble(false);
        localStorage.setItem(BUBBLE_SHOWN_KEY, '1');
      }, 5000);
      return () => clearTimeout(hideTimer);
    }, 5000);
    return () => clearTimeout(showTimer);
  }, []);

  const dismissBubble = () => {
    setShowBubble(false);
    localStorage.setItem(BUBBLE_SHOWN_KEY, '1');
  };

  const handleMouseEnter = () => {
    hoverTimerRef.current = setTimeout(() => setIsHovering(true), 200);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsHovering(false);
  };

  return (
    <>
      {/* Auto speech bubble (first visit only) */}
      {showBubble && (
        <div
          className="fixed bottom-[90px] right-[90px] z-40 flex items-center gap-2 bg-[#ffffff] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36] rounded-[10px] px-3.5 py-2.5 shadow-lg text-[13px] text-[#1e293b] dark:text-[#dce3f3] whitespace-nowrap"
          style={{ animation: 'fadeInOut 5s ease forwards' }}
        >
          {t('suggest.bubble')}
          <button onClick={dismissBubble} className="text-[#94a3b8] hover:text-[#64748b] transition-colors ml-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hover tooltip (desktop only, no pointer events on mobile) */}
      {isHovering && !showBubble && (
        <div
          role="tooltip"
          className="fixed bottom-[90px] right-[90px] z-40 bg-[#1e293b] dark:bg-[#dce3f3] text-white dark:text-[#1e293b] text-[12px] font-medium px-3 py-1.5 rounded-[8px] whitespace-nowrap pointer-events-none"
        >
          {t('suggest.tooltip')}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => { setShowBubble(false); setShowModal(true); }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={t('suggest.tooltip')}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] shadow-[0_2px_12px_rgba(14,165,233,0.4)] hover:opacity-90 transition-opacity flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>

      <SuggestServiceModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
