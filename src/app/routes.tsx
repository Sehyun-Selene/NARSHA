import { createBrowserRouter } from 'react-router';
import Root from './pages/Root';
import Home from './pages/Home';
import AppDetail from './pages/AppDetail';
import Survey from './pages/Survey';
import SurveyResult from './pages/SurveyResult';
import ReviewWrite from './pages/ReviewWrite';
import Reviews from './pages/Reviews';
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
      { path: 'survey', Component: Survey },
      { path: 'survey/result', Component: SurveyResult },
      { path: '*', Component: NotFound }
    ]
  }
]);