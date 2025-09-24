// src/components/dashboard/StatCard.tsx
import { DollarSign, LucideIcon, Users } from 'lucide-react'; // Added imports here

interface StatCardProps {
  name: string;
  value: string | number;
  icon: LucideIcon;
  change: string;
  changeType: 'neutral' | 'info' | 'positive' | 'negative';
}

export function StatCard({ name, value, icon: Icon, change, changeType }: StatCardProps) {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    info: 'text-primary',
    neutral: 'text-gray-500',
  }[changeType];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="ml-3 text-sm font-medium text-gray-500">{name}</h3>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        <div className={`mt-1 text-sm ${changeColor}`}>
          {change}
        </div>
      </div>
    </div>
  );
}