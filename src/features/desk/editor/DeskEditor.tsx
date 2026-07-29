import { useEffect, useRef } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import { toast } from 'sonner';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
// StarterKit 2.27 은 textStyle 마크를 등록하지 않는다 → Color/Highlight 가 붙을 수 있도록 명시 추가.
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useLang, type Lang } from '../../../app/lib/useLang';
import Toolbar from './Toolbar';
import { DeskImage } from './extensions/DeskImage';
import { DeskEmbed } from './extensions/DeskEmbed';
import { DeskDivider } from './extensions/DeskDivider';
import { DeskBlockquote } from './extensions/DeskBlockquote';
import QuickInsertMenu from './QuickInsertMenu';
import { uploadImage, mediaErrorMessage } from '../api/media';
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
    // blockquote·horizontalRule 는 커스텀(variant)으로 대체하므로 StarterKit 에서 끈다
    StarterKit.configure({ heading: { levels: [2, 3] }, blockquote: false, horizontalRule: false }),
    DeskBlockquote,
    DeskDivider,
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
    }),
    DeskImage.configure({ inline: false, HTMLAttributes: { loading: 'lazy' } }),
    DeskEmbed,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Placeholder.configure({ placeholder }),
    CharacterCount,
  ];
}

/** 이미지 파일들을 업로드해 에디터에 삽입 (드롭·붙여넣기 공용). */
async function uploadAndInsert(editor: Editor, files: File[], lang: Lang) {
  const images = files.filter((f) => f.type.startsWith('image/'));
  if (images.length === 0) return;
  const toastId = toast.loading(lang === 'ko' ? '이미지 업로드 중…' : 'Uploading image…');
  try {
    for (const file of images) {
      const { url } = await uploadImage(file);
      editor.chain().focus().setImage({ src: url }).run();
    }
    toast.success(lang === 'ko' ? '업로드 완료' : 'Uploaded', { id: toastId });
  } catch (e) {
    const code = (e as { code?: string })?.code ?? 'UPLOAD_FAILED';
    toast.error(mediaErrorMessage(code, lang), { id: toastId });
  }
}

export default function DeskEditor({ initialContent, placeholder, onUpdate, onEditorReady }: DeskEditorProps) {
  const [lang] = useLang();
  const ph = placeholder ?? (lang === 'ko' ? '오늘의 한국어 공부를 기록해 보세요…' : 'Write about your Korean study today…');
  const editorHolder = useRef<Editor | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: buildExtensions(ph),
    content: initialContent ?? '',
    editorProps: {
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []);
        const ed = editorHolder.current;
        if (ed && files.some((f) => f.type.startsWith('image/'))) {
          event.preventDefault();
          void uploadAndInsert(ed, files, lang);
          return true;
        }
        return false; // 텍스트/URL 은 붙여넣기 규칙(임베드)으로 넘긴다
      },
      handleDrop: (_view, event) => {
        const files = Array.from((event as DragEvent).dataTransfer?.files ?? []);
        const ed = editorHolder.current;
        if (ed && files.some((f) => f.type.startsWith('image/'))) {
          event.preventDefault();
          void uploadAndInsert(ed, files, lang);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate?.({
        json: editor.getJSON() as DeskDoc,
        html: editor.getHTML(),
        text: editor.getText(),
      });
    },
  });

  editorHolder.current = editor;

  useEffect(() => {
    onEditorReady?.(editor);
    return () => onEditorReady?.(null);
  }, [editor, onEditorReady]);

  if (!editor) return null;

  const chars = editor.storage.characterCount?.characters?.() ?? 0;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) void uploadAndInsert(editor, files, lang);
    e.target.value = '';
  };

  return (
    <div className="desk-editor">
      <Toolbar editor={editor} lang={lang} />
      <QuickInsertMenu editor={editor} lang={lang} onImageClick={() => fileRef.current?.click()} />
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
      <EditorContent editor={editor} />
      <div className="mt-3 text-right text-[12px] text-[#94a3b8]">
        {chars.toLocaleString()} {lang === 'ko' ? '자' : 'chars'}
      </div>
    </div>
  );
}
