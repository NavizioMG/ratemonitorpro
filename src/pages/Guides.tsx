import { MainLayout } from '../components/layout/MainLayout';
import { Book, Video, FileText, ArrowRight } from 'lucide-react';

export function Guides() {
  const guides = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of Rate Monitor Pro and set up your account.',
      icon: Book,
      articles: [
        'Quick Start Guide',
        'Setting Up Your Account',
        'Adding Your First Client',
        'Configuring Rate Alerts'
      ]
    },
    {
      title: 'Rate Monitoring',
      description: 'Master rate tracking and alerts for your clients.',
      icon: FileText,
      articles: [
        'Understanding Rate Tracking',
        'Setting Up Custom Alerts',
        'Rate History Analysis',
        'Export and Reporting'
      ]
    },
    {
      title: 'Client Management',
      description: 'Effectively manage your client portfolio.',
      icon: Video,
      articles: [
        'Client Dashboard Overview',
        'Managing Client Information',
        'Bulk Client Import',
        'Client Communication Tools'
      ]
    }
  ];

  return (
    <MainLayout>
      <div className="bg-white">
        {/* Header */}
        <div className="relative bg-primary">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1920&q=80"
              alt=""
              className="h-full w-full object-cover opacity-10"
            />
          </div>
          <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Guides & Tutorials
              </h1>
              <p className="mt-6 text-xl text-gray-100 max-w-3xl mx-auto">
                Learn how to get the most out of Rate Monitor Pro with our comprehensive guides.
              </p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <label htmlFor="search" className="sr-only">
              Search guides
            </label>
            <div className="relative">
              <input
                type="search"
                id="search"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                placeholder="Search guides and tutorials..."
              />
            </div>
          </div>
        </div>

        {/* Guides Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {guides.map((guide) => {
              const Icon = guide.icon;
              return (
                <div key={guide.title} className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{guide.title}</h3>
                    <p className="mt-2 text-gray-500">{guide.description}</p>
                    <ul className="mt-4 space-y-4">
                      {guide.articles.map((article) => (
                        <li key={article}>
                          <a
                            href="#"
                            className="flex items-center text-primary hover:text-primary-dark"
                          >
                            {article}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="bg-gray-50 mt-16">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Video Tutorials</h2>
              <p className="mt-4 text-lg text-gray-500">
                Learn through our step-by-step video guides
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-300">
                    <img
                      src={`https://images.unsplash.com/photo-155772015${index}-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80`}
                      alt=""
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">Getting Started Tutorial {index}</h3>
                    <p className="mt-2 text-gray-500">Learn the basics of Rate Monitor Pro in this comprehensive guide.</p>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <Video className="h-4 w-4 mr-2" />
                      10:30
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Need More Help?</h2>
            <p className="mt-4 text-lg text-gray-500">
              Our support team is here to help you succeed
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark">
                Contact Support
              </button>
              <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Visit Help Center
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}