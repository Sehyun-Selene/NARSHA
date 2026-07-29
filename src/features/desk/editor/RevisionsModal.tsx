import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Lang } from '../../../app/lib/useLang';
import { listRevisions, getRevisionContent, type RevisionMeta } from '../api/posts';
import type { DeskDoc } from '../types';

/** 서버 임시저장(리비전) 목록 → 복원 (§6.7, 최대 20개). */
export default function RevisionsModal({
  lang, postId, onClose, onRestore,
}: {
  lang: Lang;
  postId: string;
  onClose: () => void;
  onRestore: (doc: DeskDoc, title: string) => void;
}) {
  const [items, setItems] = useState<RevisionMeta[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listRevisions(postId).then(setItems).catch(() => setItems([]));
  }, [postId]);

  const restore = async (id: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const r = await getRevisionContent(id);
      onRestore((r.content_json as DeskDoc) ?? { type: 'doc', content: [] }, r.title ?? '');
    } finally {
      setBusy(false);
    }
  };

  const t = lang === 'ko'
    ? { title: '임시저장 기록', empty: '저장된 기록이 없어요.', restore: '복원', close: '닫기' }
    : { title: 'Saved drafts', empty: 'No saved drafts yet.', restore: 'Restore', close: 'Close' };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="relative w-full max-w-[420px] max-h-[80vh] overflow-y-auto rounded-[16px] bg-white dark:bg-[#151c27] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label={t.close} className="absolute top-4 right-4 text-[#94a3b8] hover:text-[#1e293b] dark:hover:text-[#dce3f3]"><X className="w-5 h-5" /></button>
        <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[18px] text-[#1e293b] dark:text-[#dce3f3] mb-4">{t.title}</h2>

        {items === null ? (
          <div className="py-8 flex justify-center"><div className="h-6 w-6 rounded-full border-2 border-[#8ecdff] border-t-transparent animate-spin" /></div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-[14px] text-[#94a3b8]">{t.empty}</p>
        ) : (
          <ul className="space-y-1.5">
            {items.map((r) => (
              <li key={r.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-[#f8fafc] dark:hover:bg-[#1e293b]">
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] text-[#1e293b] dark:text-[#dce3f3] truncate">{r.title || (lang === 'ko' ? '(제목 없음)' : '(untitled)')}</span>
                  <span className="block text-[11px] text-[#94a3b8]">{new Date(r.created_at).toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US')}</span>
                </span>
                <button onClick={() => restore(r.id)} disabled={busy} className="text-[13px] text-[#1b99dc] font-medium hover:underline disabled:opacity-50">{t.restore}</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
