// src/components/QuickActionCard.tsx
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  state?: object;
}

export function QuickActionCard({ title, description, icon: Icon, href, state }: QuickActionCardProps) {
  return (
    <Link
      to={href}
      state={state}
      className="group relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
    >
      <Icon className="mx-auto h-8 w-8 text-gray-400 group-hover:text-primary transition-colors" />
      <span className="mt-2 block text-sm font-semibold text-gray-900">{title}</span>
      <span className="mt-1 block text-sm text-gray-500">{description}</span>
    </Link>
  );
}