import { supabase } from '../../../lib/supabase';

// ── 정책 상수 (PRD §6.3 + HANDOFF §5 정정) ──────────────────────────────────
export const ACCOUNT_QUOTA_BYTES = 80 * 1024 * 1024; // 계정당 80MB (500MB→80MB 정정)
export const QUOTA_WARN_RATIO = 0.8;                  // 80% 경고
export const IMAGE_MAX_ORIGINAL_BYTES = 10 * 1024 * 1024; // 원본 10MB 초과 거부
export const IMAGE_MAX_EDGE = 1600;                   // 장변 최대 px
export const WEBP_QUALITY = 0.82;
const BUCKET = 'desk-media';

export class MediaError extends Error {
  code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

/** 이미지 → 장변 1600px, WebP 0.82 로 리사이즈. */
export async function resizeToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new MediaError('IMAGE_DECODE_FAILED');
  });
  const { width, height } = bitmap;
  const scale = Math.min(1, IMAGE_MAX_EDGE / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new MediaError('CANVAS_UNAVAILABLE');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY),
  );
  if (!blob) throw new MediaError('IMAGE_ENCODE_FAILED');
  return blob;
}

export interface QuotaInfo {
  used: number;
  limit: number;
  ratio: number;
}

/** 현재 로그인 사용자의 스토리지 사용량. */
export async function getQuota(): Promise<QuotaInfo> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new MediaError('NOT_AUTHENTICATED');
  const { data, error } = await supabase.from('profiles').select('storage_used').eq('id', uid).single();
  if (error) throw new MediaError('QUOTA_READ_FAILED');
  const used = data?.storage_used ?? 0;
  return { used, limit: ACCOUNT_QUOTA_BYTES, ratio: used / ACCOUNT_QUOTA_BYTES };
}

export interface UploadedImage {
  url: string;
  path: string;
  bytes: number;
}

/**
 * 이미지 업로드: 원본 크기 검증 → 리사이즈 → 쿼터 검증 → Storage 업로드 →
 * desk_media 행 삽입(트리거가 profiles.storage_used 자동 갱신).
 * 경로: desk/{user.id}/images/{uuid}.webp
 */
export async function uploadImage(file: File): Promise<UploadedImage> {
  if (!file.type.startsWith('image/')) throw new MediaError('NOT_AN_IMAGE');
  if (file.size > IMAGE_MAX_ORIGINAL_BYTES) throw new MediaError('IMAGE_TOO_LARGE');

  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new MediaError('NOT_AUTHENTICATED');

  const blob = await resizeToWebp(file);

  // 쿼터 검증 (업로드 직전 최신값)
  const { used, limit } = await getQuota();
  if (used + blob.size > limit) throw new MediaError('QUOTA_EXCEEDED');

  const path = `desk/${uid}/images/${crypto.randomUUID()}.webp`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: 'image/webp', upsert: false });
  if (upErr) throw new MediaError('UPLOAD_FAILED');

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

  // 원장 삽입 → 트리거가 storage_used += bytes
  const { error: rowErr } = await supabase.from('desk_media').insert({
    owner_id: uid,
    kind: 'image',
    path,
    bytes: blob.size,
    mime: 'image/webp',
  });
  if (rowErr) {
    // 원장 실패 시 방금 올린 파일 제거 (고아 방지)
    await supabase.storage.from(BUCKET).remove([path]);
    throw new MediaError('UPLOAD_FAILED');
  }

  return { url: pub.publicUrl, path, bytes: blob.size };
}

/** 에러 코드 → 한/영 메시지. */
export function mediaErrorMessage(code: string, lang: 'ko' | 'en'): string {
  const m: Record<string, { ko: string; en: string }> = {
    NOT_AN_IMAGE: { ko: '이미지 파일만 올릴 수 있어요.', en: 'Only image files can be uploaded.' },
    IMAGE_TOO_LARGE: { ko: '원본 이미지는 10MB 이하만 가능해요.', en: 'Original image must be 10MB or less.' },
    QUOTA_EXCEEDED: { ko: '저장 공간(80MB)이 가득 찼어요. 외부 링크를 이용하거나 오래된 이미지를 지워 주세요.', en: 'Storage (80MB) is full. Use external links or remove old images.' },
    NOT_AUTHENTICATED: { ko: '로그인이 필요해요.', en: 'Login required.' },
    IMAGE_DECODE_FAILED: { ko: '이미지를 읽을 수 없어요.', en: 'Could not read the image.' },
    UPLOAD_FAILED: { ko: '업로드에 실패했어요. 잠시 후 다시 시도해 주세요.', en: 'Upload failed. Please try again shortly.' },
  };
  return m[code]?.[lang] ?? (lang === 'ko' ? '업로드 중 문제가 발생했어요.' : 'Something went wrong during upload.');
}
