import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

export function ConnectionStatus() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleConnectionLost = (event: CustomEvent) => {
      setMessage(event.detail.message);
      setShowPrompt(true);
    };

    window.addEventListener('connection-lost', handleConnectionLost as EventListener);

    return () => {
      window.removeEventListener('connection-lost', handleConnectionLost as EventListener);
    };
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 pb-2 sm:pb-5">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-red-600 p-2 shadow-lg sm:p-3">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex w-0 flex-1 items-center">
              <span className="flex rounded-lg bg-red-800 p-2">
                <RefreshCw className="h-6 w-6 text-white" aria-hidden="true" />
              </span>
              <p className="ml-3 font-medium text-white">
                <span className="md:hidden">{message}</span>
                <span className="hidden md:inline">{message}</span>
              </p>
            </div>
            <div className="order-3 mt-2 w-full flex-shrink-0 sm:order-2 sm:mt-0 sm:w-auto">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50"
              >
                Refresh page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}