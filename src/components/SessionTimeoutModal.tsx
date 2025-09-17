// src/components/SessionTimeoutModal.tsx
import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

interface SessionTimeoutModalProps {
  isVisible: boolean;
  timeRemaining: string;
  onExtendSession: () => void;
  onLogout: () => void;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isVisible,
  timeRemaining,
  onExtendSession,
  onLogout,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Session Expiring Soon
            </h3>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-700 mb-3">
            Your session will expire automatically for security reasons. 
            Would you like to extend your session?
          </p>
          
          <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
            <Clock className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-lg font-mono font-bold text-red-600">
              {timeRemaining}
            </span>
            <span className="text-sm text-gray-500 ml-2">remaining</span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onExtendSession}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Extend Session
          </button>
          <button
            onClick={onLogout}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Logout Now
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-3">
          For your security, sessions automatically expire after 24 hours of login.
        </p>
      </div>
    </div>
  );
};