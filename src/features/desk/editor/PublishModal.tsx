import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { Lang } from '../../../app/lib/useLang';
import { PUBLISH_COPYRIGHT_TEXT } from '../legal/consentText';

const MAX_TAGS = 5;

function extractImages(html: string): string[] {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return Array.from(doc.querySelectorAll('img')).map((i) => i.getAttribute('src') || '').filter(Boolean).slice(0, 8);
  } catch {
    return [];
  }
}

/** 발행 전 체크리스트 모달 (§6.7). 저작권 확인 필수. */
export default function PublishModal({
  lang, html, text, onClose, onPublish,
}: {
  lang: Lang;
  html: string;
  text: string;
  onClose: () => void;
  onPublish: (opts: {
    coverUrl: string | null;
    summary: string;
    tags: string[];
    visibility: 'public' | 'private';
    copyrightConsent: { lang: Lang; text: string };
  }) => Promise<void>;
}) {
  const images = useMemo(() => extractImages(html), [html]);
  const [cover, setCover] = useState<string | null>(images[0] ?? null);
  const [summary, setSummary] = useState(text.slice(0, 120));
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [copyright, setCopyright] = useState(false);
  const [busy, setBusy] = useState(false);

  const t = lang === 'ko' ? {
    title: '발행하기', cover: '대표 이미지', none: '없음', tags: '태그 (최대 5개)', tagPh: '입력 후 Enter',
    summary: '요약', visibility: '공개 범위', pub: '전체 공개', priv: '비공개',
    publish: '발행', publishing: '발행 중…', cancel: '취소',
  } : {
    title: 'Publish', cover: 'Cover image', none: 'None', tags: 'Tags (max 5)', tagPh: 'Type and press Enter',
    summary: 'Summary', visibility: 'Visibility', pub: 'Public', priv: 'Private',
    publish: 'Publish', publishing: 'Publishing…', cancel: 'Cancel',
  };
  const copyrightText = PUBLISH_COPYRIGHT_TEXT[lang];

  const addTag = () => {
    const v = tagInput.trim().replace(/^#/, '');
    if (v && tags.length < MAX_TAGS && !tags.includes(v)) setTags([...tags, v]);
    setTagInput('');
  };

  const submit = async () => {
    if (!copyright || busy) return;
    setBusy(true);
    try {
      // 발행 시 저작권 확인은 게시물 단위로 서버에 기록된다 (법무 검토 §7.3)
      await onPublish({
        coverUrl: cover, summary: summary.trim(), tags, visibility,
        copyrightConsent: { lang, text: copyrightText },
      });
    } catch {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="relative w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-[16px] bg-white dark:bg-[#151c27] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label={t.cancel} className="absolute top-4 right-4 text-[#94a3b8] hover:text-[#1e293b] dark:hover:text-[#dce3f3]"><X className="w-5 h-5" /></button>
        <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[20px] text-[#1e293b] dark:text-[#dce3f3] mb-5">{t.title}</h2>

        {/* 대표 이미지 */}
        {images.length > 0 && (
          <div className="mb-4">
            <p className="text-[13px] font-medium text-[#64748b] dark:text-[#bec7d2] mb-1.5">{t.cover}</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setCover(null)} className={`w-16 h-16 rounded-lg border-2 text-[11px] text-[#94a3b8] flex items-center justify-center ${cover === null ? 'border-[#8ecdff]' : 'border-[#e2e8f0] dark:border-[#232a36]'}`}>{t.none}</button>
              {images.map((src) => (
                <button key={src} onClick={() => setCover(src)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${cover === src ? 'border-[#8ecdff]' : 'border-transparent'}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 태그 */}
        <div className="mb-4">
          <p className="text-[13px] font-medium text-[#64748b] dark:text-[#bec7d2] mb-1.5">{t.tags}</p>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {tags.map((tg) => (
              <span key={tg} className="px-2.5 py-1 rounded-full bg-[#e0f2fe] dark:bg-[#1b5a7a] text-[#0369a1] dark:text-[#8ecdff] text-[12px]">
                #{tg} <button onClick={() => setTags(tags.filter((x) => x !== tg))} className="ml-1">×</button>
              </span>
            ))}
          </div>
          {tags.length < MAX_TAGS && (
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              placeholder={t.tagPh}
              className="w-full rounded-[10px] border border-[#e2e8f0] dark:border-[#232a36] bg-transparent px-3 py-2 text-[14px] outline-none focus:border-[#8ecdff]"
            />
          )}
        </div>

        {/* 요약 */}
        <div className="mb-4">
          <p className="text-[13px] font-medium text-[#64748b] dark:text-[#bec7d2] mb-1.5">{t.summary}</p>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} className="w-full rounded-[10px] border border-[#e2e8f0] dark:border-[#232a36] bg-transparent px-3 py-2 text-[14px] outline-none focus:border-[#8ecdff] resize-none" />
        </div>

        {/* 공개 범위 */}
        <div className="mb-4">
          <p className="text-[13px] font-medium text-[#64748b] dark:text-[#bec7d2] mb-1.5">{t.visibility}</p>
          <div className="flex gap-2">
            {(['public', 'private'] as const).map((v) => (
              <button key={v} onClick={() => setVisibility(v)} className={`px-4 py-2 rounded-full text-[13px] ${visibility === v ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white' : 'bg-[#f1f5f9] dark:bg-[#232a36] text-[#64748b] dark:text-[#bec7d2]'}`}>
                {v === 'public' ? t.pub : t.priv}
              </button>
            ))}
          </div>
        </div>

        {/* 저작권 확인 (필수) */}
        <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
          <input type="checkbox" checked={copyright} onChange={(e) => setCopyright(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#0ea5e9] shrink-0" />
          <span className="text-[13px] leading-[1.6] text-[#1e293b] dark:text-[#dce3f3]">{copyrightText}</span>
        </label>

        <div className="flex gap-2">
          <button onClick={onClose} className="px-5 py-2.5 rounded-[10px] border border-[#e2e8f0] dark:border-[#232a36] text-[14px] text-[#64748b] dark:text-[#bec7d2]">{t.cancel}</button>
          <button onClick={submit} disabled={!copyright || busy} className="flex-1 bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[15px] py-2.5 rounded-[10px] hover:opacity-90 disabled:opacity-50">
            {busy ? t.publishing : t.publish}
          </button>
        </div>
      </div>
    </div>
  );
}
