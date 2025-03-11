import { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { MainFooter } from './MainFooter';

interface Props {
  children: ReactNode;
}

export function MainLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>{children}</main>
      <MainFooter />
    </div>
  );
}