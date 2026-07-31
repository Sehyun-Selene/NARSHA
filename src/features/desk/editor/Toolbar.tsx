import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link2, Highlighter, Baseline,
  Superscript as SuperscriptIcon, Subscript as SubscriptIcon,
  Rows3, Columns3, Merge, Trash2, SquareStack,
} from 'lucide-react';
import type { Lang } from '../../../app/lib/useLang';
import { CHAR_CATEGORIES, getRecentChars, pushRecentChar } from './charPaletteData';

// 사업 브랜드 팔레트 (글자색·형광펜 공용)
const SWATCHES = ['#1e293b', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0ea5e9', '#1b99dc', '#7c3aed', '#db2777', '#64748b', '#8ecdff', '#ffffff'];
const HIGHLIGHTS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#e9d5ff', '#fed7aa'];

const L = {
  ko: {
    style: '양식', body: '본문', h2: '대제목', h3: '소제목', quote: '인용구',
    bold: '굵게', italic: '기울임', underline: '밑줄', strike: '취소선',
    color: '글자색', highlight: '형광펜', reset: '지우기',
    alignL: '왼쪽 정렬', alignC: '가운데 정렬', alignR: '오른쪽 정렬', alignJ: '양쪽 정렬',
    ul: '순서 없는 목록', ol: '순서 있는 목록', link: '링크', linkPrompt: '링크 주소를 입력하세요',
    fontSize: '글자 크기', sup: '위첨자', sub: '아래첨자',
    letterSpacing: '자간', letterNarrow: '좁게', letterNormal: '기본', letterWide: '넓게',
    lineHeight: '줄간격', charPalette: '문자표', recent: '최근 사용',
    rowBefore: '위에 행 추가', rowAfter: '아래에 행 추가', rowDelete: '행 삭제',
    colBefore: '왼쪽에 열 추가', colAfter: '오른쪽에 열 추가', colDelete: '열 삭제',
    merge: '셀 병합/분할', headerRow: '헤더 행', tableDelete: '표 삭제',
  },
  en: {
    style: 'Style', body: 'Body', h2: 'Heading', h3: 'Subheading', quote: 'Quote',
    bold: 'Bold', italic: 'Italic', underline: 'Underline', strike: 'Strikethrough',
    color: 'Text color', highlight: 'Highlight', reset: 'Reset',
    alignL: 'Align left', alignC: 'Align center', alignR: 'Align right', alignJ: 'Justify',
    ul: 'Bullet list', ol: 'Numbered list', link: 'Link', linkPrompt: 'Enter the link URL',
    fontSize: 'Font size', sup: 'Superscript', sub: 'Subscript',
    letterSpacing: 'Letter spacing', letterNarrow: 'Narrow', letterNormal: 'Default', letterWide: 'Wide',
    lineHeight: 'Line height', charPalette: 'Special characters', recent: 'Recently used',
    rowBefore: 'Insert row above', rowAfter: 'Insert row below', rowDelete: 'Delete row',
    colBefore: 'Insert column left', colAfter: 'Insert column right', colDelete: 'Delete column',
    merge: 'Merge/split cells', headerRow: 'Header row', tableDelete: 'Delete table',
  },
} as const;

const FONT_SIZES = ['11', '13', '15', '16', '19', '24', '28', '30', '34'] as const;
const LINE_HEIGHTS = ['1.0', '1.2', '1.5', '1.8', '2.0'] as const;
const LETTER_SPACINGS = { narrow: '-0.05em', normal: null, wide: '0.05em' } as const;

type OpenPanel = 'none' | 'color' | 'highlight' | 'char';

export default function Toolbar({ editor, lang }: { editor: Editor; lang: Lang }) {
  const t = L[lang];
  const wrapRef = useRef<HTMLDivElement>(null);
  const colorBtnRef = useRef<HTMLButtonElement>(null);
  const hlBtnRef = useRef<HTMLButtonElement>(null);
  const charBtnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState<OpenPanel>('none');
  const [panelLeft, setPanelLeft] = useState(0);
  const [charTab, setCharTab] = useState(CHAR_CATEGORIES[0].key);
  const [recentChars, setRecentChars] = useState<string[]>([]);

  // 바깥 클릭 시 팔레트 닫기
  useEffect(() => {
    if (open === 'none') return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen('none');
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // 팔레트를 스크롤 컨테이너 바깥(툴바 래퍼)에 띄우고, 클릭한 버튼 아래로 정렬
  const openPanel = (which: OpenPanel, btn: HTMLButtonElement | null) => {
    if (open === which) { setOpen('none'); return; }
    if (btn && wrapRef.current) {
      const b = btn.getBoundingClientRect();
      const w = wrapRef.current.getBoundingClientRect();
      const panelWidth = which === 'char' ? 300 : 184;
      setPanelLeft(Math.max(0, Math.min(b.left - w.left, w.width - panelWidth)));
    }
    setOpen(which);
  };

  const styleValue = editor.isActive('heading', { level: 2 })
    ? 'h2'
    : editor.isActive('heading', { level: 3 })
    ? 'h3'
    : editor.isActive('blockquote')
    ? 'quote'
    : 'body';

  const setStyle = (v: string) => {
    const chain = editor.chain().focus();
    if (v === 'h2') chain.setNode('heading', { level: 2 }).run();
    else if (v === 'h3') chain.setNode('heading', { level: 3 }).run();
    else if (v === 'quote') chain.toggleBlockquote().run();
    else chain.setParagraph().run();
  };

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt(t.linkPrompt, prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertChar = (c: string) => {
    editor.chain().focus().insertContent(c).run();
    setRecentChars(pushRecentChar(c));
  };

  return (
    <div ref={wrapRef} className="sticky top-16 z-10 -mx-1 mb-4 border-b border-[#e2e8f0] dark:border-[#232a36] bg-white/90 dark:bg-[#0c141f]/90 backdrop-blur">
      <div className="flex flex-wrap items-center gap-1 px-1 py-2">
        {/* 양식 */}
        <select
          aria-label={t.style}
          value={styleValue}
          onChange={(e) => setStyle(e.target.value)}
          className="h-8 rounded-md border border-[#e2e8f0] dark:border-[#232a36] bg-transparent px-2 text-[13px] text-[#1e293b] dark:text-[#dce3f3]"
        >
          <option value="body">{t.body}</option>
          <option value="h2">{t.h2}</option>
          <option value="h3">{t.h3}</option>
          <option value="quote">{t.quote}</option>
        </select>

        {/* 글자 크기 */}
        <select
          aria-label={t.fontSize}
          value={(editor.getAttributes('textStyle').fontSize as string | undefined)?.replace('pt', '') ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) editor.chain().focus().unsetFontSize().run();
            else editor.chain().focus().setFontSize(`${v}pt`).run();
          }}
          className="h-8 rounded-md border border-[#e2e8f0] dark:border-[#232a36] bg-transparent px-2 text-[13px] text-[#1e293b] dark:text-[#dce3f3] w-[88px]"
        >
          <option value="">{lang === 'ko' ? '크기' : 'Size'}</option>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <Sep />

        <Btn label={t.bold} active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="w-4 h-4" /></Btn>
        <Btn label={t.italic} active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="w-4 h-4" /></Btn>
        <Btn label={t.underline} active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="w-4 h-4" /></Btn>
        <Btn label={t.strike} active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="w-4 h-4" /></Btn>
        <Btn label={t.sup} active={editor.isActive('superscript')} onClick={() => editor.chain().focus().toggleSuperscript().run()}><SuperscriptIcon className="w-4 h-4" /></Btn>
        <Btn label={t.sub} active={editor.isActive('subscript')} onClick={() => editor.chain().focus().toggleSubscript().run()}><SubscriptIcon className="w-4 h-4" /></Btn>
        <Btn
          btnRef={charBtnRef}
          label={t.charPalette}
          active={open === 'char'}
          onClick={() => { if (open !== 'char') setRecentChars(getRecentChars()); openPanel('char', charBtnRef.current); }}
        >
          <span className="text-[15px] leading-none">Ω</span>
        </Btn>

        <Sep />

        {/* 글자색 · 형광펜 — 팝오버는 아래 래퍼 레벨에서 렌더(스크롤 클리핑 회피) */}
        <Btn btnRef={colorBtnRef} label={t.color} active={open === 'color'} onClick={() => openPanel('color', colorBtnRef.current)}><Baseline className="w-4 h-4" /></Btn>
        <Btn btnRef={hlBtnRef} label={t.highlight} active={open === 'highlight' || editor.isActive('highlight')} onClick={() => openPanel('highlight', hlBtnRef.current)}><Highlighter className="w-4 h-4" /></Btn>

        <Sep />

        <Btn label={t.alignL} active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft className="w-4 h-4" /></Btn>
        <Btn label={t.alignC} active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter className="w-4 h-4" /></Btn>
        <Btn label={t.alignR} active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight className="w-4 h-4" /></Btn>
        <Btn label={t.alignJ} active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}><AlignJustify className="w-4 h-4" /></Btn>

        <div className="basis-full h-0" aria-hidden="true" />

        {/* 자간 */}
        <select
          aria-label={t.letterSpacing}
          value={
            editor.getAttributes('textStyle').letterSpacing === LETTER_SPACINGS.narrow ? 'narrow'
            : editor.getAttributes('textStyle').letterSpacing === LETTER_SPACINGS.wide ? 'wide'
            : 'normal'
          }
          onChange={(e) => {
            const v = e.target.value as keyof typeof LETTER_SPACINGS;
            const chain = editor.chain().focus();
            if (LETTER_SPACINGS[v]) chain.setLetterSpacing(LETTER_SPACINGS[v]).run();
            else chain.unsetLetterSpacing().run();
          }}
          className="h-8 rounded-md border border-[#e2e8f0] dark:border-[#232a36] bg-transparent px-1.5 text-[13px] text-[#1e293b] dark:text-[#dce3f3]"
        >
          <option value="narrow">{t.letterNarrow}</option>
          <option value="normal">{t.letterNormal}</option>
          <option value="wide">{t.letterWide}</option>
        </select>

        {/* 줄간격 */}
        <select
          aria-label={t.lineHeight}
          value={(editor.getAttributes('paragraph').lineHeight as string | undefined) ?? '1.0'}
          onChange={(e) => editor.chain().focus().setLineHeight(e.target.value).run()}
          className="h-8 rounded-md border border-[#e2e8f0] dark:border-[#232a36] bg-transparent px-1.5 text-[13px] text-[#1e293b] dark:text-[#dce3f3]"
        >
          {LINE_HEIGHTS.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

        <Sep />

        <Btn label={t.ul} active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="w-4 h-4" /></Btn>
        <Btn label={t.ol} active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="w-4 h-4" /></Btn>

        <Sep />

        <Btn label={t.link} active={editor.isActive('link')} onClick={setLink}><Link2 className="w-4 h-4" /></Btn>
      </div>

      {/* 표 컨텍스트 바 — 커서가 표 안에 있을 때만 노출 */}
      {editor.isActive('table') && (
        <div className="flex flex-wrap items-center gap-1 px-1 pb-2 border-t border-dashed border-[#e2e8f0] dark:border-[#232a36] pt-2">
          <Btn label={t.rowBefore} onClick={() => editor.chain().focus().addRowBefore().run()}><Rows3 className="w-4 h-4" /></Btn>
          <Btn label={t.rowAfter} onClick={() => editor.chain().focus().addRowAfter().run()}><Rows3 className="w-4 h-4 rotate-180" /></Btn>
          <Btn label={t.rowDelete} onClick={() => editor.chain().focus().deleteRow().run()}><Trash2 className="w-4 h-4" /></Btn>
          <Sep />
          <Btn label={t.colBefore} onClick={() => editor.chain().focus().addColumnBefore().run()}><Columns3 className="w-4 h-4" /></Btn>
          <Btn label={t.colAfter} onClick={() => editor.chain().focus().addColumnAfter().run()}><Columns3 className="w-4 h-4 rotate-180" /></Btn>
          <Btn label={t.colDelete} onClick={() => editor.chain().focus().deleteColumn().run()}><Trash2 className="w-4 h-4 rotate-90" /></Btn>
          <Sep />
          <Btn label={t.merge} onClick={() => editor.chain().focus().mergeOrSplit().run()}><Merge className="w-4 h-4" /></Btn>
          <Btn label={t.headerRow} active={editor.isActive('tableHeader')} onClick={() => editor.chain().focus().toggleHeaderRow().run()}><SquareStack className="w-4 h-4" /></Btn>
          <Sep />
          <Btn label={t.tableDelete} onClick={() => editor.chain().focus().deleteTable().run()}><Trash2 className="w-4 h-4 text-[#dc2626]" /></Btn>
        </div>
      )}

      {/* 팔레트 — 스크롤 컨테이너 밖, 버튼 아래에 온전히 표시 */}
      {open === 'color' && (
        <Palette
          left={panelLeft}
          colors={SWATCHES}
          resetLabel={t.reset}
          onPick={(c) => { editor.chain().focus().setColor(c).run(); setOpen('none'); }}
          onReset={() => { editor.chain().focus().unsetColor().run(); setOpen('none'); }}
        />
      )}
      {open === 'highlight' && (
        <Palette
          left={panelLeft}
          colors={HIGHLIGHTS}
          resetLabel={t.reset}
          onPick={(c) => { editor.chain().focus().toggleHighlight({ color: c }).run(); setOpen('none'); }}
          onReset={() => { editor.chain().focus().unsetHighlight().run(); setOpen('none'); }}
        />
      )}
      {open === 'char' && (
        <CharPanel
          left={panelLeft}
          lang={lang}
          recentLabel={t.recent}
          recentChars={recentChars}
          tab={charTab}
          onTab={setCharTab}
          onPick={insertChar}
        />
      )}
    </div>
  );
}

const Btn = ({ label, active, onClick, children, btnRef }: {
  label: string; active?: boolean; onClick: () => void; children: ReactNode;
  btnRef?: React.Ref<HTMLButtonElement>;
}) => (
  <button
    ref={btnRef}
    type="button"
    aria-label={label}
    title={label}
    aria-pressed={active}
    // 에디터 selection 유지 — 툴바 클릭이 선택 영역을 날리지 않게 한다
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={[
      'flex items-center justify-center w-8 h-8 rounded-md shrink-0 transition-colors',
      active
        ? 'bg-[#e0f2fe] dark:bg-[#1b5a7a] text-[#0369a1] dark:text-[#8ecdff]'
        : 'text-[#64748b] dark:text-[#bec7d2] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b]',
    ].join(' ')}
  >
    {children}
  </button>
);

function Sep() {
  return <span className="w-px h-5 bg-[#e2e8f0] dark:bg-[#232a36] mx-0.5 shrink-0" />;
}

function Palette({ left, colors, resetLabel, onPick, onReset }: {
  left: number; colors: readonly string[]; resetLabel: string;
  onPick: (c: string) => void; onReset: () => void;
}) {
  return (
    <div
      className="absolute top-full mt-1 z-30 p-2 rounded-lg border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#151c27] shadow-lg"
      style={{ left }}
    >
      <div className="grid grid-cols-6 gap-1.5 w-[168px]">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onPick(c)}
            className="w-6 h-6 rounded-full border border-[#e2e8f0] dark:border-[#334155]"
            style={{ background: c }}
            aria-label={c}
          />
        ))}
      </div>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onReset} className="mt-2 w-full text-[12px] text-[#64748b] hover:text-[#1e293b] dark:hover:text-[#dce3f3]">
        ✕ {resetLabel}
      </button>
    </div>
  );
}

function CharPanel({ left, lang, recentLabel, recentChars, tab, onTab, onPick }: {
  left: number; lang: Lang; recentLabel: string; recentChars: string[];
  tab: string; onTab: (k: string) => void; onPick: (c: string) => void;
}) {
  const activeCat = CHAR_CATEGORIES.find((c) => c.key === tab) ?? CHAR_CATEGORIES[0];
  return (
    <div
      className="absolute top-full mt-1 z-30 p-2 rounded-lg border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#151c27] shadow-lg w-[292px]"
      style={{ left }}
    >
      {recentChars.length > 0 && (
        <div className="mb-2 pb-2 border-b border-[#f1f5f9] dark:border-[#232a36]">
          <div className="mb-1 text-[11px] text-[#94a3b8]">{recentLabel}</div>
          <div className="grid grid-cols-10 gap-0.5">
            {recentChars.map((c, i) => (
              <button
                key={`${c}-${i}`}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPick(c)}
                className="flex items-center justify-center w-6 h-6 rounded text-[14px] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b]"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mb-2 flex flex-wrap gap-1">
        {CHAR_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onTab(cat.key)}
            className={[
              'rounded px-1.5 py-0.5 text-[11px]',
              tab === cat.key
                ? 'bg-[#e0f2fe] dark:bg-[#1b5a7a] text-[#0369a1] dark:text-[#8ecdff]'
                : 'text-[#64748b] dark:text-[#94a3b8] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b]',
            ].join(' ')}
          >
            {lang === 'ko' ? cat.labelKo : cat.labelEn}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-10 gap-0.5 max-h-[168px] overflow-y-auto">
        {activeCat.chars.map((c, i) => (
          <button
            key={`${c}-${i}`}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onPick(c)}
            className="flex items-center justify-center w-6 h-6 rounded text-[14px] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b]"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
