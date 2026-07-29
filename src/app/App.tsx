import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import FloatingSuggestButton from './components/FloatingSuggestButton';
import AuthProvider from '../features/desk/auth/AuthProvider';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <FloatingSuggestButton />
      <Toaster position="bottom-center" richColors />
    </AuthProvider>
  );
}
