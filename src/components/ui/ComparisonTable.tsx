import { Check, X } from 'lucide-react';
import { Tooltip } from '/ui/Tooltip';

const features = [
  {
    name: 'Rate Monitoring',
    description: 'Track mortgage rates in real-time',
    starter: true,
    professional: true,
    enterprise: true
  },
  {
    name: 'Client Management',
    description: 'Manage your client portfolio',
    starter: '25 clients',
    professional: '100 clients',
    enterprise: 'Unlimited'
  },
  {
    name: 'Rate Alerts',
    description: 'Get notified when rates match your criteria',
    starter: 'Basic',
    professional: 'Advanced',
    enterprise: 'Custom'
  },
  {
    name: 'API Access',
    description: 'Integrate with your existing systems',
    starter: false,
    professional: true,
    enterprise: true
  },
  {
    name: 'White Labeling',
    description: 'Custom branding options',
    starter: false,
    professional: false,
    enterprise: true
  },
  {
    name: 'Support',
    description: '24/7 customer support',
    starter: 'Email',
    professional: 'Priority',
    enterprise: 'Dedicated'
  }
];

export function ComparisonTable() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Compare Plans
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Choose the plan that best fits your needs
          </p>
        </div>

        <div className="mt-12 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Features
                </th>
                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                  Starter
                </th>
                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                  Professional
                </th>
                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {features.map((feature) => (
                <tr key={feature.name}>
                  <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <Tooltip content={feature.description}>
                      <div className="font-medium text-gray-900 cursor-help">{feature.name}</div>
                    </Tooltip>
                  </td>
                  {['starter', 'professional', 'enterprise'].map((plan) => (
                    <td key={plan} className="px-3 py-4 text-sm text-center">
                      {typeof feature[plan] === 'boolean' ? (
                        feature[plan] ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-900">{feature[plan]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}