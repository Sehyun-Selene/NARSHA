import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import Root from './pages/Root';
import Home from './pages/Home';
import AppDetail from './pages/AppDetail';
import Survey from './pages/Survey';
import SurveyIntro from './pages/SurveyIntro';
import SurveyResult from './pages/SurveyResult';
import ReviewWrite from './pages/ReviewWrite';
import Reviews from './pages/Reviews';
import About from './pages/About';
import Methodology from './pages/Methodology';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

// 「나의 한국어 책상」 공개 읽기 화면
import DeskFeed from './pages/desk/DeskFeed';
import DeskProfile from './pages/desk/DeskProfile';
import DeskPost from './pages/desk/DeskPost';
import DeskLogin from './pages/desk/DeskLogin';
import DeskJoin from './pages/desk/DeskJoin';
import DeskManage from './pages/desk/DeskManage';
import DeskSettings from './pages/desk/DeskSettings';
import DeskAdmin from './pages/desk/DeskAdmin';
import RequireAuthor from '../features/desk/auth/RequireAuthor';

// 에디터는 코드 분할 — 방문자 번들에 포함되지 않는다 (PRD §9)
const DeskWrite = lazy(() => import('./pages/desk/DeskWrite'));

function DeskWriteRoute() {
  return (
    <RequireAuthor>
      <Suspense fallback={null}>
        <DeskWrite />
      </Suspense>
    </RequireAuthor>
  );
}

// Router configuration for NARSHA platform
export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'reviews', Component: Reviews },
      { path: 'apps/:id', Component: AppDetail },
      { path: 'apps/:id/review/new', Component: ReviewWrite },
      { path: 'survey/questions', Component: Survey },
      { path: 'survey/result', Component: SurveyResult },
      { path: 'survey', Component: SurveyIntro },
      { path: 'about', Component: About },
      { path: 'methodology', Component: Methodology },
      { path: 'privacy', Component: PrivacyPolicy },
      { path: 'terms', Component: TermsOfService },

      // 「나의 한국어 책상」
      // 개발 전용 에디터 미리보기 (프로덕션 빌드에서는 제외). 로그인 없이 에디터 확인용.
      ...(import.meta.env.DEV
        ? [{ path: 'desk/_preview', element: <Suspense fallback={null}><DeskWrite /></Suspense> }]
        : []),
      { path: 'desk', Component: DeskFeed },
      { path: 'desk/login', Component: DeskLogin },
      { path: 'desk/join', Component: DeskJoin },
      { path: 'desk/write', element: <DeskWriteRoute /> },
      { path: 'desk/write/:postId', element: <DeskWriteRoute /> },
      { path: 'desk/manage', element: <RequireAuthor><DeskManage /></RequireAuthor> },
      { path: 'desk/settings', element: <RequireAuthor><DeskSettings /></RequireAuthor> },
      // handleParam 은 '@handle' 형태로 받아 컴포넌트에서 검증한다 (@ 없으면 404)
      { path: 'desk/:handleParam', Component: DeskProfile },
      { path: 'desk/:handleParam/:slug', Component: DeskPost },

      { path: import.meta.env.VITE_ADMIN_PATH || 'admin', Component: AdminDashboard },
      { path: `${import.meta.env.VITE_ADMIN_PATH || 'admin'}/desk`, Component: DeskAdmin },
      { path: '*', Component: NotFound }
    ]
  }
]);
