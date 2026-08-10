import { useEffect, useRef, useState } from 'react';
import { FloatingMenu, type Editor } from '@tiptap/react';
import { Plus, Image as ImageIcon, Smile, Minus, Quote, ChevronRight, Table as TableIcon, Paperclip, CalendarDays } from 'lucide-react';
import type { Lang } from '../../../app/lib/useLang';
import { DIVIDER_VARIANTS, type DividerVariant } from './extensions/DeskDivider';
import { QUOTE_VARIANTS, type QuoteVariant } from './extensions/DeskBlockquote';

type Sub = 'none' | 'divider' | 'quote' | 'sticker';

// 자체 팔레트 (외부 라이브러리 불필요). 한국어 학습 기록 맥락에서 자주 쓸 법한 것 위주.
const STICKERS = [
  '😀', '😂', '🥰', '😅', '😭', '😳', '🥺', '😴',
  '👍', '👏', '🙌', '🙏', '💪', '✌️', '🤝', '👀',
  '❤️', '🔥', '✨', '⭐', '🎉', '🎊', '💯', '✅',
  '📚', '✏️', '📝', '🇰🇷', '🗣️', '☕', '🌱', '🏆',
];

/**
 * 좌측 + 빠른 삽입 (§6.2). 빈 문단일 때만 표시된다.
 * 항목: 사진 / 스티커(Phase 2 비활성) / 구분선 ▸ / 인용구 ▸.
 * 서브메뉴는 텍스트 목록이 아니라 실제 렌더된 미리보기를 보여준다.
 */
export default function QuickInsertMenu({
  editor,
  lang,
  onImageClick,
  onFileClick,
  onDateClick,
}: {
  editor: Editor;
  lang: Lang;
  onImageClick: () => void;
  onFileClick: () => void;
  onDateClick: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<Sub>('none');
  const wrapRef = useRef<HTMLDivElement>(null);

  // 메뉴 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) { setOpen(false); setSub('none'); }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const t = lang === 'ko'
    ? { photo: '사진', sticker: '스티커', divider: '구분선', quote: '인용구', table: '표', file: '파일', date: '일정' }
    : { photo: 'Photo', sticker: 'Sticker', divider: 'Divider', quote: 'Quote', table: 'Table', file: 'File', date: 'Date' };

  const close = () => { setOpen(false); setSub('none'); };

  const insertDivider = (v: DividerVariant) => { editor.chain().focus().setDeskDivider(v).run(); close(); };
  const insertQuote = (v: QuoteVariant) => { editor.chain().focus().setQuoteVariant(v).run(); close(); };
  const insertSticker = (emoji: string) => { editor.chain().focus().insertContent(emoji).run(); close(); };
  const insertTable = () => { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); close(); };

  return (
    <FloatingMenu
      editor={editor}
      tippyOptions={{ placement: 'left-start', offset: [0, 40], interactive: true }}
      shouldShow={({ editor: e }) =>
        e.isEditable && e.isActive('paragraph') && e.state.selection.empty &&
        e.state.selection.$anchor.parent.content.size === 0
      }
    >
      <div ref={wrapRef} className="relative" onMouseDown={(ev) => ev.preventDefault()}>
        <button
          type="button"
          aria-label={lang === 'ko' ? '빠른 삽입' : 'Quick insert'}
          onClick={() => (open ? close() : setOpen(true))}
          className="flex items-center justify-center w-7 h-7 rounded-full border border-[#e2e8f0] dark:border-[#232a36] text-[#64748b] dark:text-[#bec7d2] hover:border-[#8ecdff] hover:text-[#8ecdff] transition-colors bg-white dark:bg-[#0c141f]"
        >
          <Plus className="w-4 h-4" />
        </button>

        {open && (
          <div className="absolute left-9 top-0 z-30 w-44 rounded-xl border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#151c27] shadow-lg py-1.5">
            <MenuRow icon={<ImageIcon className="w-4 h-4" />} label={t.photo} onHover={() => setSub('none')} onClick={() => { onImageClick(); close(); }} />
            <MenuRow icon={<CalendarDays className="w-4 h-4" />} label={t.date} onHover={() => setSub('none')} onClick={() => { onDateClick(); close(); }} />
            <MenuRow icon={<Paperclip className="w-4 h-4" />} label={t.file} onHover={() => setSub('none')} onClick={() => { onFileClick(); close(); }} />
            {/* 호버만 해도 서브메뉴가 열린다. 클릭도 그대로 동작(터치 기기 대응) */}
            <MenuRow icon={<Smile className="w-4 h-4" />} label={t.sticker} chevron active={sub === 'sticker'} onHover={() => setSub('sticker')} onClick={() => setSub(sub === 'sticker' ? 'none' : 'sticker')} />
            <MenuRow icon={<Minus className="w-4 h-4" />} label={t.divider} chevron active={sub === 'divider'} onHover={() => setSub('divider')} onClick={() => setSub(sub === 'divider' ? 'none' : 'divider')} />
            <MenuRow icon={<Quote className="w-4 h-4" />} label={t.quote} chevron active={sub === 'quote'} onHover={() => setSub('quote')} onClick={() => setSub(sub === 'quote' ? 'none' : 'quote')} />
            <MenuRow icon={<TableIcon className="w-4 h-4" />} label={t.table} onHover={() => setSub('none')} onClick={insertTable} />

            {/*
              서브메뉴는 sm 이상에서 오른쪽으로 펼친다(항목을 가리지 않고 바로 보인다).
              좁은 화면에서는 오른쪽 공간이 없어 화면을 넘치므로 아래로 펼친다.
            */}
            {sub !== 'none' && (
              <div className="absolute right-0 top-full sm:right-auto sm:left-full sm:top-0 sm:ml-1.5 z-40 rounded-xl border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#151c27] shadow-lg p-2">
                {sub === 'sticker' && (
                  <div className="grid grid-cols-6 gap-1 w-[212px]">
                    {STICKERS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => insertSticker(emoji)}
                        className="flex items-center justify-center w-8 h-8 rounded-md text-[17px] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b]"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {sub === 'divider' && (
                  <div className="grid gap-1.5 w-[176px]">
                    {DIVIDER_VARIANTS.map((v) => (
                      <button key={v} type="button" onClick={() => insertDivider(v)} className="rounded-md px-2 py-1 hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b]" title={v}>
                        <div className="desk-hr" data-variant={v} style={{ margin: 0, height: '1.2em', pointerEvents: 'none' }} />
                      </button>
                    ))}
                  </div>
                )}

                {sub === 'quote' && (
                  <div className="grid grid-cols-2 gap-1.5 w-[176px] desk-prose">
                    {QUOTE_VARIANTS.map((v) => (
                      <button key={v} type="button" onClick={() => insertQuote(v)} className="rounded-md p-1 hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b]" title={v}>
                        <blockquote className="desk-quote" data-variant={v} style={{ margin: 0, fontSize: 9, padding: '0.5em 0.6em', pointerEvents: 'none' }}>
                          <p>Aa</p>
                        </blockquote>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </FloatingMenu>
  );
}

function MenuRow({
  icon, label, note, chevron, active, disabled, onClick, onHover,
}: {
  icon: React.ReactNode; label: string; note?: string; chevron?: boolean;
  active?: boolean; disabled?: boolean; onClick?: () => void; onHover?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={onHover}
      onFocus={onHover}
      onClick={onClick}
      className={[
        'w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors',
        disabled ? 'opacity-40 cursor-default' : 'hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b]',
        active ? 'text-[#8ecdff]' : 'text-[#1e293b] dark:text-[#dce3f3]',
      ].join(' ')}
    >
      <span className="text-[#64748b] dark:text-[#94a3b8]">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {note && <span className="text-[11px] text-[#94a3b8]">{note}</span>}
      {chevron && <ChevronRight className="w-3.5 h-3.5" />}
    </button>
  );
}
