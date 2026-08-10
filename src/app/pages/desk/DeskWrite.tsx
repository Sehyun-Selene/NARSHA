import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import DeskShell from './_DeskShell';
import { useLang } from '../../lib/useLang';
import { useDeskAuth } from '../../../features/desk/auth/useDeskAuth';
import DeskEditor, { type EditorUpdate } from '../../../features/desk/editor/DeskEditor';
import PublishModal from '../../../features/desk/editor/PublishModal';
import RevisionsModal from '../../../features/desk/editor/RevisionsModal';
import { saveDraft, addRevision, publishPost } from '../../../features/desk/api/posts';
import { supabase } from '../../../lib/supabase';
import type { DeskDoc } from '../../../features/desk/types';

const AUTOSAVE_LOCAL_MS = 3000;
const AUTOSAVE_SERVER_MS = 60000;

type LoadState = 'loading' | 'ready';

interface LocalDraft { title: string; json: DeskDoc; savedAt: number; }

/**
 * 초안이 사실상 비었는지 판정. 에디터를 열어만 봐도 빈 문단 하나가 자동저장되므로,
 * 이걸 걸러내지 않으면 새 글을 쓸 때마다 복구 배너가 뜬다.
 */
function isDraftEmpty(draft: LocalDraft): boolean {
  if (draft.title?.trim()) return false;
  const walk = (node: unknown): boolean => {
    if (!node || typeof node !== 'object') return true;
    const n = node as { type?: string; text?: string; content?: unknown[] };
    if (n.text?.trim()) return false;
    // 이미지·구분선·표 같은 내용 노드가 있으면 빈 글이 아니다
    if (n.type && !['doc', 'paragraph', 'text'].includes(n.type)) return false;
    return (n.content ?? []).every(walk);
  };
  return walk(draft.json);
}

export default function DeskWrite() {
  const [lang] = useLang();
  const navigate = useNavigate();
  const { postId: routePostId } = useParams();
  const { profile } = useDeskAuth();

  const localKey = `desk-draft-${routePostId ?? 'new'}`;

  const [state, setState] = useState<LoadState>('loading');
  const [initialDoc, setInitialDoc] = useState<DeskDoc | null>(null);
  const [title, setTitle] = useState('');

  const serverId = useRef<string | null>(routePostId ?? null);
  const latest = useRef<{ title: string; json: DeskDoc; html: string; text: string }>({ title: '', json: { type: 'doc', content: [] }, html: '', text: '' });
  const dirtyLocal = useRef(false);
  const dirtyServer = useRef(false);
  // 마지막으로 버전 기록에 남긴 내용. 같은 내용이면 새 버전을 만들지 않는다.
  const lastRevision = useRef<string | null>(null);

  const [saveCount, setSaveCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showRevisions, setShowRevisions] = useState(false);
  const [recovered, setRecovered] = useState<LocalDraft | null>(null);
  const [editorKey, setEditorKey] = useState(0); // 복원 시 에디터 remount 용

  // ── 초기 로드 ────────────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    (async () => {
      let doc: DeskDoc = { type: 'doc', content: [] };
      let t = '';

      let serverUpdatedAt = 0;
      if (routePostId) {
        // 기존 글 로드 (본인 글만 RLS 로 열림)
        const { data } = await supabase.from('desk_posts').select('*').eq('id', routePostId).maybeSingle();
        if (data) {
          doc = data.content_json as DeskDoc;
          t = data.title ?? '';
          serverUpdatedAt = new Date(data.updated_at).getTime();
        }
      }

      // localStorage 복구본이 더 최신일 때만 배너로 제안한다.
      // 빈 초안이나 이미 서버에 반영된 초안은 지우고 배너를 띄우지 않는다 —
      // 그러지 않으면 새 글을 열 때마다 배너가 뜬다.
      try {
        const raw = localStorage.getItem(localKey);
        if (raw) {
          const ld = JSON.parse(raw) as LocalDraft;
          const stale = serverUpdatedAt > 0 && (ld.savedAt ?? 0) <= serverUpdatedAt;
          if (!ld?.json || isDraftEmpty(ld) || stale) {
            localStorage.removeItem(localKey);
          } else {
            setRecovered(ld);
          }
        }
      } catch { /* ignore */ }

      if (!active) return;
      setInitialDoc(doc);
      setTitle(t);
      latest.current = { title: t, json: doc, html: '', text: '' };
      setState('ready');
    })();
    return () => { active = false; };
  }, [routePostId, localKey]);

  // ── localStorage 자동저장 (3초 debounce) ───────────────────────────────────
  const localTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleLocalSave = useCallback(() => {
    if (localTimer.current) clearTimeout(localTimer.current);
    localTimer.current = setTimeout(() => {
      try {
        const { title: tt, json } = latest.current;
        localStorage.setItem(localKey, JSON.stringify({ title: tt, json, savedAt: Date.now() } satisfies LocalDraft));
      } catch { /* quota */ }
    }, AUTOSAVE_LOCAL_MS);
  }, [localKey]);

  // ── 서버 자동저장 (60초 주기, dirty 일 때만) ────────────────────────────────
  const doServerSave = useCallback(async () => {
    if (!dirtyServer.current || saving) return;
    dirtyServer.current = false;
    setSaving(true);
    try {
      const { title: tt, json, html, text } = latest.current;
      const res = await saveDraft({ id: serverId.current ?? undefined, title: tt || (lang === 'ko' ? '(제목 없음)' : '(untitled)'), contentJson: json, contentHtml: html, contentText: text });
      serverId.current = res.id;
      // 제목·본문이 지난 버전과 같으면 기록을 남기지 않는다 (같은 내용이 여러 줄로
      // 쌓여서 서로 다른 초안처럼 보이던 문제).
      const fingerprint = JSON.stringify({ tt, json });
      if (fingerprint !== lastRevision.current) {
        await addRevision(res.id, tt, json);
        lastRevision.current = fingerprint;
        setSaveCount((n) => n + 1);
      }
      dirtyLocal.current = false;
      // 서버에 반영됐으므로 로컬 복구본은 역할이 끝났다. 남겨두면 다음 진입에서
      // 이미 저장된 내용을 "복구할까요?" 로 다시 묻게 된다.
      try { localStorage.removeItem(localKey); } catch { /* ignore */ }
    } catch {
      dirtyServer.current = true; // 실패 시 다음 주기 재시도
    } finally {
      setSaving(false);
    }
  }, [lang, saving, localKey]);

  useEffect(() => {
    const iv = setInterval(() => { void doServerSave(); }, AUTOSAVE_SERVER_MS);
    return () => clearInterval(iv);
  }, [doServerSave]);

  // ── 이탈 경고 ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyLocal.current) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  // ── ⌘/Ctrl+S → 즉시 임시저장 (§9 접근성) ───────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void doServerSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doServerSave]);

  const onEditorUpdate = useCallback((u: EditorUpdate) => {
    latest.current = { ...latest.current, json: u.json, html: u.html, text: u.text };
    dirtyLocal.current = true;
    dirtyServer.current = true;
    scheduleLocalSave();
  }, [scheduleLocalSave]);

  const onTitle = (v: string) => {
    setTitle(v);
    latest.current = { ...latest.current, title: v };
    dirtyLocal.current = true;
    dirtyServer.current = true;
    scheduleLocalSave();
  };

  const handlePublish = async (opts: {
    coverUrl: string | null; summary: string; tags: string[]; visibility: 'public' | 'private';
    copyrightConsent: { lang: 'ko' | 'en'; text: string };
  }) => {
    // 발행 전 서버에 최신 저장 보장
    const { title: tt, json, html, text } = latest.current;
    const saved = await saveDraft({ id: serverId.current ?? undefined, title: tt || (lang === 'ko' ? '(제목 없음)' : '(untitled)'), contentJson: json, contentHtml: html, contentText: text });
    serverId.current = saved.id;
    const { slug } = await publishPost({
      id: saved.id, title: tt, contentJson: json, contentHtml: html, contentText: text,
      coverUrl: opts.coverUrl, summary: opts.summary, tags: opts.tags, visibility: opts.visibility,
      copyrightConsent: opts.copyrightConsent,
    });
    dirtyLocal.current = false;
    dirtyServer.current = false;
    try { localStorage.removeItem(localKey); } catch { /* ignore */ }
    toast.success(lang === 'ko' ? '발행되었습니다.' : 'Published.');
    if (opts.visibility === 'public' && profile) navigate(`/desk/@${profile.handle}/${slug}`);
    else navigate('/desk/manage');
  };

  if (state === 'loading') {
    return (
      <DeskShell width="narrow">
        <div className="py-24 flex justify-center" aria-busy="true">
          <div className="h-8 w-8 rounded-full border-2 border-[#8ecdff] border-t-transparent animate-spin" />
        </div>
      </DeskShell>
    );
  }

  return (
    <DeskShell width="narrow">
      {/* localStorage 복구 배너 */}
      {recovered && (
        <div className="mt-2 mb-6 flex items-center gap-3 rounded-lg border border-[#8ecdff] bg-[#e0f2fe] dark:bg-[#1b5a7a]/30 px-4 py-2 text-[13px]">
          <span className="flex-1 text-[#0369a1] dark:text-[#8ecdff]">
            {lang === 'ko' ? '저장되지 않은 작성 중 내용이 있어요. 복원할까요?' : 'Found unsaved changes. Restore?'}
          </span>
          <button
            className="font-bold text-[#1b99dc]"
            onClick={() => {
              setInitialDoc(recovered.json);
              setTitle(recovered.title);
              latest.current = { ...latest.current, title: recovered.title, json: recovered.json };
              setEditorKey((k) => k + 1);
              setRecovered(null);
            }}
          >
            {lang === 'ko' ? '복원' : 'Restore'}
          </button>
          <button
            className="text-[#64748b]"
            onClick={() => {
              // 상태만 끄면 다음 진입에서 같은 배너가 다시 뜬다 — 저장본까지 지운다.
              try { localStorage.removeItem(localKey); } catch { /* ignore */ }
              setRecovered(null);
            }}
          >
            {lang === 'ko' ? '무시' : 'Dismiss'}
          </button>
        </div>
      )}

      <input
        value={title}
        onChange={(e) => onTitle(e.target.value)}
        placeholder={lang === 'ko' ? '제목' : 'Title'}
        aria-label={lang === 'ko' ? '제목' : 'Title'}
        className="w-full bg-transparent border-none outline-none font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[28px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.03em] placeholder:text-[#cbd5e1] dark:placeholder:text-[#334155] mb-2"
      />
      <div className="border-b border-[#e2e8f0] dark:border-[#232a36] mb-4" />

      <DeskEditor key={editorKey} initialContent={initialDoc} onUpdate={onEditorUpdate} />

      {/* 하단 바 — 작성 영역 아래, 화면 하단에 고정 */}
      <div className="sticky bottom-0 z-20 -mx-6 mt-6 px-6 py-2 flex items-center gap-3 bg-white/90 dark:bg-[#0c141f]/90 backdrop-blur border-t border-[#e2e8f0] dark:border-[#232a36]">
        <button
          onClick={() => setShowRevisions(true)}
          className="text-[13px] text-[#64748b] dark:text-[#bec7d2] hover:text-[#1b99dc]"
          disabled={!serverId.current}
        >
          {/* '임시저장'은 /desk/manage 의 미발행 글 탭과 이름이 겹쳐 오해를 부른다.
              이 버튼이 여는 것은 자동저장이 쌓아 온 '버전 기록'이다. */}
          {lang === 'ko' ? `버전 기록 ${saveCount}` : `History ${saveCount}`}
          {saving && <span className="ml-1 text-[#94a3b8]">…</span>}
        </button>
        <button
          onClick={() => { void doServerSave(); }}
          className="text-[13px] text-[#64748b] dark:text-[#bec7d2] hover:text-[#1b99dc]"
        >
          {lang === 'ko' ? '저장' : 'Save'}
        </button>
        <button
          onClick={() => setShowPublish(true)}
          className="ml-auto bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[14px] px-5 py-2 rounded-full hover:opacity-90"
        >
          {lang === 'ko' ? '발행' : 'Publish'}
        </button>
      </div>

      {showPublish && (
        <PublishModal
          lang={lang}
          html={latest.current.html}
          text={latest.current.text}
          onClose={() => setShowPublish(false)}
          onPublish={handlePublish}
        />
      )}
      {showRevisions && serverId.current && (
        <RevisionsModal
          lang={lang}
          postId={serverId.current}
          onClose={() => setShowRevisions(false)}
          onRestore={(doc, t) => {
            setInitialDoc(doc);
            setTitle(t);
            latest.current = { ...latest.current, title: t, json: doc };
            dirtyServer.current = true;
            setEditorKey((k) => k + 1);
            setShowRevisions(false);
          }}
        />
      )}
    </DeskShell>
  );
}
