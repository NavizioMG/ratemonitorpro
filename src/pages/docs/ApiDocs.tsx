import { Link } from 'react-router-dom';
import { ArrowLeft, Code2 } from 'lucide-react';

export function ApiDocs() {
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
          <h1>API Documentation</h1>

          <h2>Rate Monitoring API</h2>
          <div className="bg-gray-800 text-white p-4 rounded-md">
            <pre>
              <code>
                GET /functions/fetch-rates{'\n'}
                Response: MortgageRate[]
              </code>
            </pre>
          </div>

          <h2>Client Management API</h2>
          <div className="bg-gray-800 text-white p-4 rounded-md">
            <pre>
              <code>
                POST /rest/v1/clients{'\n'}
                Body: {'{'}
                  first_name: string{'\n'}
                  last_name: string{'\n'}
                  email: string{'\n'}
                  phone?: string{'\n'}
                {'}'}
              </code>
            </pre>
          </div>

          <h2>Subscription Management API</h2>
          <div className="bg-gray-800 text-white p-4 rounded-md">
            <pre>
              <code>
                POST /functions/create-checkout-session{'\n'}
                Body: {'{'}
                  priceId: string{'\n'}
                {'}'}
              </code>
            </pre>
          </div>

          <p>
            For detailed API documentation, please refer to our{' '}
            <a href="https://github.com/yourusername/mortgage-rate-monitor/wiki/API-Documentation" className="text-primary hover:text-primary-dark">
              API Reference Guide
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}