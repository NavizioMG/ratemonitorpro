// src/App.tsx (Updated)
import { Outlet } from 'react-router-dom';
import { Head } from './components/ui/Head';

export function App() {
  return (
    <>
      <Head />
      {/* Child routes will be rendered here */}
      <Outlet />
    </>
  );
}