import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import FloatingSuggestButton from './components/FloatingSuggestButton';
import AuthProvider from '../features/desk/auth/AuthProvider';
import MemberAuthProvider from '../features/auth/MemberAuthProvider';

export default function App() {
  // 인증 컨텍스트가 두 개다 (CLAUDE.md §3, PRD 결정 D6).
  //   AuthProvider       — desk 저자 (profiles, 초대코드 전용)
  //   MemberAuthProvider — 일반회원 (members, 자유 가입)
  // 같은 Supabase 세션을 구독하지만 조회하는 표가 달라 합치지 않았다. desk 쪽
  // 코드와 RLS 정책을 건드리지 않는 것이 이 구조의 목적이다.
  return (
    <AuthProvider>
      <MemberAuthProvider>
        <RouterProvider router={router} />
        <FloatingSuggestButton />
        <Toaster position="bottom-center" richColors />
      </MemberAuthProvider>
    </AuthProvider>
  );
}
