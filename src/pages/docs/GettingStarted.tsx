import { Link } from 'react-router-dom';
import { ArrowLeft, Terminal, Package, Cog, PlayCircle } from 'lucide-react';

export function GettingStarted() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/docs" className="flex items-center text-primary hover:text-primary-dark">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Documentation
          </Link>
        </div>

        <div className="prose prose-lg max-w-none">
          <h1>Getting Started with Rate Monitor Pro</h1>
          
          <h2 className="flex items-center">
            <Terminal className="h-6 w-6 mr-2" />
            Prerequisites
          </h2>
          <ul>
            <li>Node.js 20.x or higher</li>
            <li>npm 9.x or higher</li>
            <li>Git</li>
          </ul>

          <h2 className="flex items-center">
            <Package className="h-6 w-6 mr-2" />
            Installation
          </h2>
          <div className="bg-gray-800 text-white p-4 rounded-md">
            <pre>
              <code>
                git clone https://github.com/yourusername/mortgage-rate-monitor.git{'\n'}
                cd mortgage-rate-monitor{'\n'}
                npm install{'\n'}
                cd api && npm install
              </code>
            </pre>
          </div>

          <h2 className="flex items-center">
            <Cog className="h-6 w-6 mr-2" />
            Configuration
          </h2>
          <p>
            Create a <code>.env</code> file in the root directory with the following variables:
          </p>
          <div className="bg-gray-800 text-white p-4 rounded-md">
            <pre>
              <code>
                VITE_SUPABASE_URL=your_supabase_url{'\n'}
                VITE_SUPABASE_ANON_KEY=your_supabase_anon_key{'\n'}
                VITE_FRED_API_KEY=your_fred_api_key
              </code>
            </pre>
          </div>

          <h2 className="flex items-center">
            <PlayCircle className="h-6 w-6 mr-2" />
            Running the Application
          </h2>
          <p>Start the development server:</p>
          <div className="bg-gray-800 text-white p-4 rounded-md">
            <pre>
              <code>
                npm run dev
              </code>
            </pre>
          </div>
          <p>
            The application will be available at{' '}
            <code>http://localhost:5173</code>
          </p>

          <h2>Next Steps</h2>
          <ul>
            <li>
              <Link to="/docs/api" className="text-primary hover:text-primary-dark">
                Explore the API documentation
              </Link>
            </li>
            <li>
              <Link to="/docs/tutorials" className="text-primary hover:text-primary-dark">
                Watch video tutorials
              </Link>
            </li>
            <li>
              <Link to="/docs/help" className="text-primary hover:text-primary-dark">
                Visit the help center
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}