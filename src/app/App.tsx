import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import FloatingSuggestButton from './components/FloatingSuggestButton';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <FloatingSuggestButton />
      <Toaster position="bottom-center" richColors />
    </>
  );
}
