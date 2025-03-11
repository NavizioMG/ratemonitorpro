import { MainLayout } from '../components/layout/MainLayout';
import { Cookie, Shield, Settings, Info } from 'lucide-react';

export function CookiePolicy() {
  const cookieTypes = [
    {
      title: 'Essential Cookies',
      description: 'Required for basic site functionality',
      required: true
    },
    {
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website',
      required: false
    },
    {
      title: 'Functional Cookies',
      description: 'Enable enhanced functionality and personalization',
      required: false
    },
    {
      title: 'Marketing Cookies',
      description: 'Used to deliver relevant advertisements',
      required: false
    }
  ];

  return (
    <MainLayout>
      <div className="bg-white">
        {/* Header */}
        <div className="relative bg-primary">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Cookie Policy
              </h1>
              <p className="mt-6 text-xl text-gray-100 max-w-3xl mx-auto">
                Understanding how we use cookies to improve your experience
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2>What are cookies?</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device
              when you visit a website. They are widely used to make websites work more
              efficiently and provide a better user experience.
            </p>

            <h2 className="mt-12">How we use cookies</h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {cookieTypes.map((type) => (
                <div
                  key={type.title}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Cookie className="h-5 w-5 text-primary" />
                      <h3 className="ml-2 text-lg font-medium text-gray-900">
                        {type.title}
                      </h3>
                    </div>
                    {type.required ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Required
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-gray-500">{type.description}</p>
                </div>
              ))}
            </div>

            <h2 className="mt-12">Managing Cookies</h2>
            <p>
              You can control and manage cookies in various ways. Please keep in mind that
              removing or blocking cookies can impact your user experience and parts of our
              website might no longer be fully accessible.
            </p>

            <div className="mt-8 space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center">
                  <Settings className="h-6 w-6 text-primary" />
                  <h3 className="ml-2 text-lg font-medium text-gray-900">
                    Browser Settings
                  </h3>
                </div>
                <p className="mt-2 text-gray-500">
                  Most web browsers allow you to manage cookies through their settings preferences.
                  To learn more about how to manage cookies, visit your browser's help section.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center">
                  <Shield className="h-6 w-6 text-primary" />
                  <h3 className="ml-2 text-lg font-medium text-gray-900">
                    Cookie Preferences
                  </h3>
                </div>
                <p className="mt-2 text-gray-500">
                  You can adjust your cookie preferences at any time using our cookie settings panel.
                  Click the button below to open the settings.
                </p>
                <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark">
                  Cookie Settings
                </button>
              </div>
            </div>

            <h2 className="mt-12">Updates to this Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices
              or for operational, legal, or regulatory reasons. We encourage you to periodically
              review this page for the latest information on our cookie practices.
            </p>

            <div className="mt-12 bg-blue-50 rounded-lg p-6">
              <div className="flex items-start">
                <Info className="h-6 w-6 text-blue-600 mt-1" />
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-blue-900">Questions about cookies?</h3>
                  <p className="mt-2 text-blue-700">
                    If you have any questions about our use of cookies or this Cookie Policy,
                    please contact our privacy team at privacy@ratemonitorpro.com
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 border-t border-gray-200 pt-8">
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}