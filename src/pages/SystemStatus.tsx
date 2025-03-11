import { MainLayout } from '../components/layout/MainLayout';
import { CheckCircle, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function SystemStatus() {
  const [lastUpdated] = useState(new Date());

  const systems = [
    {
      name: 'API',
      status: 'operational',
      description: 'All API endpoints are responding normally'
    },
    {
      name: 'Web Application',
      status: 'operational',
      description: 'All features are working as expected'
    },
    {
      name: 'Rate Monitoring',
      status: 'operational',
      description: 'Rate updates and alerts are processing normally'
    },
    {
      name: 'Database',
      status: 'operational',
      description: 'Database operations are performing normally'
    },
    {
      name: 'Authentication',
      status: 'operational',
      description: 'User authentication is working properly'
    },
    {
      name: 'Notifications',
      status: 'degraded',
      description: 'Email notifications may be delayed by 5-10 minutes'
    }
  ];

  const incidents = [
    {
      date: '2024-03-10',
      title: 'Email Notification Delays',
      status: 'investigating',
      updates: [
        {
          timestamp: '2024-03-10T14:30:00Z',
          message: 'We are investigating delays in email notification delivery.'
        },
        {
          timestamp: '2024-03-10T14:45:00Z',
          message: 'The issue has been identified and we are working on a fix.'
        }
      ]
    }
  ];

  return (
    <MainLayout>
      <div className="bg-white">
        {/* Header */}
        <div className="relative bg-primary">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                System Status
              </h1>
              <div className="mt-4 flex items-center justify-center text-gray-100">
                <Clock className="h-5 w-5 mr-2" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
            <div className="px-6 py-5">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Current Status</h3>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {systems.map((system) => (
                  <div key={system.name} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                      {system.status === 'operational' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      )}
                      <h4 className="ml-2 text-lg font-medium text-gray-900">{system.name}</h4>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{system.description}</p>
                    <div className="mt-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          system.status === 'operational'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {system.status === 'operational' ? 'Operational' : 'Degraded Performance'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Incident History */}
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
            <div className="px-6 py-5">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Incidents</h3>
            </div>
            <div className="px-6 py-5">
              {incidents.map((incident) => (
                <div key={incident.date} className="mb-8 last:mb-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900">{incident.title}</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {incident.status}
                    </span>
                  </div>
                  <div className="mt-4 space-y-4">
                    {incident.updates.map((update, index) => (
                      <div key={index} className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <RefreshCw className="h-4 w-4 text-gray-500" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            {new Date(update.timestamp).toLocaleTimeString()}
                          </p>
                          <p className="mt-1 text-sm text-gray-900">{update.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subscribe to Updates */}
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-8 sm:p-10 sm:pb-6">
              <div className="flex items-center justify-center">
                <h3 className="text-2xl font-medium text-white text-center">
                  Subscribe to Status Updates
                </h3>
              </div>
              <div className="mt-4 flex items-center justify-center text-sm text-gray-100">
                <p>Get notified about system status changes and incidents</p>
              </div>
              <form className="mt-6 sm:flex justify-center">
                <input
                  type="email"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="Enter your email"
                />
                <button
                  type="submit"
                  className="mt-3 sm:mt-0 sm:ml-3 block w-full rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-primary shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary sm:w-auto"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}