// src/components/WelcomeModal.tsx
interface WelcomeModalProps {
    onClose: () => void;
  }
  
  export function WelcomeModal({ onClose }: WelcomeModalProps) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 animate-slide-in-up">
          <div className="flex justify-center mb-6">
            <div className="bg-primary text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold">
              RMP
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Welcome to Rate Monitor Pro!
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Your account is now active—get started by adding your first client.
          </p>
          <button
            onClick={onClose}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors duration-200"
          >
            Let's Go!
          </button>
        </div>
      </div>
    );
  }