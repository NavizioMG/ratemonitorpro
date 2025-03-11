import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Clock } from 'lucide-react';

export function Tutorials() {
  const tutorials = [
    {
      title: 'Getting Started with Rate Monitor Pro',
      duration: '5:30',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Learn how to set up your account and start monitoring rates.'
    },
    {
      title: 'Managing Your Client Portfolio',
      duration: '8:45',
      thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Master client management and portfolio organization.'
    },
    {
      title: 'Setting Up Rate Alerts',
      duration: '6:15',
      thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Configure automated rate alerts for your clients.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/docs" className="flex items-center text-primary hover:text-primary-dark">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Documentation
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Video Tutorials</h1>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tutorials.map((tutorial) => (
            <div key={tutorial.title} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative">
                <img
                  src={tutorial.thumbnail}
                  alt={tutorial.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{tutorial.title}</h3>
                <p className="mt-2 text-gray-500">{tutorial.description}</p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {tutorial.duration}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}