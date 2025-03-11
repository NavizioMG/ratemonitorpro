import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Home, Search } from 'lucide-react';

export function NotFound() {
  return (
    <MainLayout>
      <div className="min-h-[80vh] bg-white flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <p className="text-6xl font-bold text-primary">404</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Page not found</h1>
          <p className="mt-6 text-base leading-7 text-gray-600">Sorry, we couldn't find the page you're looking for.</p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/"
              className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary flex items-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Go back home
            </Link>
            <Link
              to="/help"
              className="text-sm font-semibold text-gray-900 flex items-center"
            >
              <Search className="h-4 w-4 mr-2" />
              Search help center
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}