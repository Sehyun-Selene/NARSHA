import { useEffect } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
// StarterKit 2.27 은 textStyle 마크를 등록하지 않는다 → Color/Highlight 가 붙을 수 있도록 명시 추가.
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useLang } from '../../../app/lib/useLang';
import Toolbar from './Toolbar';
import type { DeskDoc } from '../types';
import './editor.css';

export interface EditorUpdate {
  json: DeskDoc;
  html: string;
  text: string;
}

interface DeskEditorProps {
  initialContent?: DeskDoc | null;
  placeholder?: string;
  onUpdate?: (u: EditorUpdate) => void;
  onEditorReady?: (editor: Editor | null) => void;
}

export function buildExtensions(placeholder: string) {
  return [
    StarterKit.configure({ heading: { levels: [2, 3] } }),
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
    }),
    Image.configure({ inline: false, HTMLAttributes: { loading: 'lazy' } }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Placeholder.configure({ placeholder }),
    CharacterCount,
  ];
}

export default function DeskEditor({ initialContent, placeholder, onUpdate, onEditorReady }: DeskEditorProps) {
  const [lang] = useLang();
  const ph = placeholder ?? (lang === 'ko' ? '오늘의 한국어 공부를 기록해 보세요…' : 'Write about your Korean study today…');

  const editor = useEditor({
    extensions: buildExtensions(ph),
    content: initialContent ?? '',
    onUpdate: ({ editor }) => {
      onUpdate?.({
        json: editor.getJSON() as DeskDoc,
        html: editor.getHTML(),
        text: editor.getText(),
      });
    },
  });

  useEffect(() => {
    onEditorReady?.(editor);
    return () => onEditorReady?.(null);
  }, [editor, onEditorReady]);

  if (!editor) return null;

  const chars = editor.storage.characterCount?.characters?.() ?? 0;

  return (
    <div className="desk-editor">
      <Toolbar editor={editor} lang={lang} />
      <EditorContent editor={editor} />
      <div className="mt-3 text-right text-[12px] text-[#94a3b8]">
        {chars.toLocaleString()} {lang === 'ko' ? '자' : 'chars'}
      </div>
    </div>
  );
}
