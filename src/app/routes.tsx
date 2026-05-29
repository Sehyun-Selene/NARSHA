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
      { path: import.meta.env.VITE_ADMIN_PATH || 'admin', Component: AdminDashboard },
      { path: '*', Component: NotFound }
    ]
  }
]);