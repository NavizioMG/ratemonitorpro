import { Users, Building2, Globe2, Star } from 'lucide-react';
import { Tooltip } from './Tooltip';

export function SocialProof() {
  const metrics = [
    {
      icon: Users,
      value: '5,000+',
      label: 'Mortgage Professionals',
      tooltip: 'Active users on our platform'
    },
    {
      icon: Building2,
      value: '$2B+',
      label: 'Loan Volume Monitored',
      tooltip: 'Total loan volume tracked through our platform'
    },
    {
      icon: Globe2,
      value: '50+',
      label: 'States Covered',
      tooltip: 'Operating across the United States'
    },
    {
      icon: Star,
      value: '4.9/5',
      label: 'Customer Rating',
      tooltip: 'Average rating from verified customers'
    }
  ];

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Tooltip key={metric.label} content={metric.tooltip}>
                <div className="flex flex-col items-center gap-y-2 cursor-help">
                  <Icon className="h-8 w-8 text-primary" />
                  <dt className="text-base leading-7 text-gray-600">{metric.label}</dt>
                  <dd className="text-3xl font-semibold tracking-tight text-gray-900">
                    {metric.value}
                  </dd>
                </div>
              </Tooltip>
            );
          })}
        </dl>
      </div>
    </div>
  );
}