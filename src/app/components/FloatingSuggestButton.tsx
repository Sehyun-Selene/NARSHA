import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import SuggestServiceModal from './SuggestServiceModal';

const BUBBLE_SHOWN_KEY = 'narsha-suggest-bubble-shown';

export default function FloatingSuggestButton() {
  const [showBubble, setShowBubble] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(BUBBLE_SHOWN_KEY)) return;
    const showTimer = setTimeout(() => {
      setShowBubble(true);
      const hideTimer = setTimeout(() => {
        setShowBubble(false);
        localStorage.setItem(BUBBLE_SHOWN_KEY, '1');
      }, 3000);
      return () => clearTimeout(hideTimer);
    }, 5000);
    return () => clearTimeout(showTimer);
  }, []);

  const dismissBubble = () => {
    setShowBubble(false);
    localStorage.setItem(BUBBLE_SHOWN_KEY, '1');
  };

  return (
    <>
      {/* Speech bubble */}
      {showBubble && (
        <div className="fixed bottom-[90px] right-[90px] z-40 flex items-center gap-2 bg-[#ffffff] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36] rounded-[10px] px-3.5 py-2.5 shadow-lg text-[13px] text-[#1e293b] dark:text-[#dce3f3] whitespace-nowrap animate-fade-in">
          Can't find a service?
          <button onClick={dismissBubble} className="text-[#94a3b8] hover:text-[#64748b] transition-colors ml-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => { setShowBubble(false); setShowModal(true); }}
        aria-label="Suggest a service"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] shadow-[0_2px_12px_rgba(14,165,233,0.4)] hover:opacity-90 transition-opacity flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>

      <SuggestServiceModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
