import { AlertCircle, CheckCircle, Info } from 'lucide-react'
import { useEffect, useRef } from 'react';

export function Alert({
  type = 'error',
  message,
  children,
}: {
  type?: 'error' | 'success' | 'info' | 'neutral'
  message: string;
  children?: React.ReactNode;
}) {

  const alertRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (alertRef.current) {
      alertRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);
  const iconMap = {
    error: <AlertCircle className="text-error w-5 h-5" />,
    success: <CheckCircle className="text-success w-5 h-5" />,
    info: <Info className="text-blue-500 w-5 h-5" />,
    neutral: <Info className="text-gray-11 w-5 h-5" />,
  };

  const bgMap = {
    error: 'bg-red-100 dark:bg-red-900/20',
    success: 'bg-green-100 dark:bg-green-900/20',
    info: 'bg-blue-100 dark:bg-blue-900/20',
    neutral: 'bg-gray-8 ',
  };

  return (
    <div ref={alertRef} className={`flex items-start gap-3 p-3 rounded-md text-sm ${bgMap[type]}`}>
      {iconMap[type]}
      <div className="flex flex-col items-start">
        <span className="text-dark-2 dark:text-white">{message}</span>
        {children}
      </div>
    </div>
  );
}

