import { Link } from 'react-router-dom';
import { BookOpen, Code2, Video, HelpCircle, ArrowRight } from 'lucide-react';

export function Documentation() {
  const sections = [
    {
      title: 'Getting Started',
      description: 'Learn how to set up and start using Rate Monitor Pro',
      icon: BookOpen,
      link: '/docs/getting-started'
    },
    {
      title: 'API Documentation',
      description: 'Detailed API reference and integration guides',
      icon: Code2,
      link: '/docs/api'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides for common tasks',
      icon: Video,
      link: '/docs/tutorials'
    },
    {
      title: 'Help Center',
      description: 'FAQs, troubleshooting, and support resources',
      icon: HelpCircle,
      link: '/docs/help'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Documentation
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-100">
              Everything you need to know about Rate Monitor Pro
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.title}
                to={section.link}
                className="relative block bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <Icon className="h-8 w-8 text-primary" />
                  <h2 className="ml-4 text-2xl font-semibold text-gray-900">
                    {section.title}
                  </h2>
                </div>
                <p className="mt-4 text-gray-500">{section.description}</p>
                <div className="mt-4 flex items-center text-primary">
                  Learn more
                  <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}