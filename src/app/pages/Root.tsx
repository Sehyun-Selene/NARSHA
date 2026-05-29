import { Outlet } from 'react-router';
import { ThemeProvider } from '../context/ThemeContext';
import ScrollToTop from '../components/ScrollToTop';

export default function Root() {
  return (
    <ThemeProvider>
      <ScrollToTop />
      <Outlet />
    </ThemeProvider>
  );
}
