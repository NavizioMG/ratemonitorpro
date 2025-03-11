import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  isTargetMet: boolean;
  percentageToTarget: number;
  className?: string;
}

export function RateStatusBadge({ isTargetMet, percentageToTarget, className = '' }: Props) {
  if (isTargetMet) {
    return (
      <span 
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`}
        role="status"
        aria-label="Target rate met"
      >
        <CheckCircle2 className="w-4 h-4 mr-1" />
        Target Met
      </span>
    );
  }

  return (
    <div 
      className={`inline-flex flex-col ${className}`}
      role="status"
      aria-label={`Monitoring - ${Math.round(percentageToTarget)}% to target`}
    >
      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        <AlertTriangle className="w-4 h-4 mr-1" />
        Monitoring
      </div>
      <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className="bg-amber-500 h-1.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, percentageToTarget))}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}