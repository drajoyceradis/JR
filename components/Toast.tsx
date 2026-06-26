import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  const event = new CustomEvent('app-toast', { detail: { message, type } });
  window.dispatchEvent(event);
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: 'success' | 'error' | 'info' }>;
      const { message, type } = customEvent.detail;
      const id = Math.random().toString(36).substring(2, 9);
      
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto-remove after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    window.addEventListener('app-toast', handleToastEvent);
    return () => {
      window.removeEventListener('app-toast', handleToastEvent);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              className="pointer-events-auto bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl p-4 flex items-start gap-3 relative overflow-hidden"
            >
              {/* Colored status line at left */}
              <div 
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  isSuccess ? 'bg-[#B5A475]' : isError ? 'bg-red-500' : 'bg-blue-500'
                }`}
              />
              
              <div className="flex-shrink-0 mt-0.5 ml-1">
                {isSuccess && <CheckCircle className="text-[#B5A475]" size={18} />}
                {isError && <XCircle className="text-red-500" size={18} />}
                {toast.type === 'info' && <Info className="text-blue-500" size={18} />}
              </div>
              
              <div className="flex-grow pr-4">
                <p className="text-xs font-sans font-medium text-stone-800 dark:text-stone-200 leading-relaxed">
                  {toast.message}
                </p>
              </div>

              <button 
                onClick={() => removeToast(toast.id)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors pointer-events-auto shrink-0 mt-0.5"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
