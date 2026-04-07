import { Outlet } from 'react-router';
import { ThemeProvider } from '../context/ThemeContext';

export default function Root() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}
