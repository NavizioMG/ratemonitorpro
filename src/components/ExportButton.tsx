import { Download } from 'lucide-react';
import { exportChatHistory } from '../utils/exportChat';

interface Props {
  chatHistory: any[];
  className?: string;
}

export function ExportButton({ chatHistory, className = '' }: Props) {
  return (
    <button
      onClick={() => exportChatHistory(chatHistory)}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${className}`}
    >
      <Download className="h-4 w-4 mr-2" />
      Export Chat History
    </button>
  );
}