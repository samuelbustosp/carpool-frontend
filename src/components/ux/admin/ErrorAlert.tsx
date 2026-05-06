"use client";

import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: 'X' | 'Y';
}

export function ErrorAlert({
  icon,
  title,
  description,
  variant = 'X'
}: EmptyStateProps) {
  return (
    <>
      {variant === 'X' ? (
        <div className="flex items-center justify-center p-4 gap-4 w-full">
          <div className="bg-red-800/20 rounded-lg p-3 border border-red-500/20 text-red-200">
            {icon}
          </div>

          <div className="border border-gray-6 h-12"></div>

          <div>
            <p className="text-lg font-medium leading-tight">{title}</p>
            <p className="text-sm text-gray-11/90 font-inter truncate">
              {description}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-4 gap-2 w-full h-full bg-dark-5/70 rounded-lg">
          <div className="bg-red-800/20 rounded-lg p-3 border border-red-500/20 text-red-200">
            {icon}
          </div>

          <div className="border border-gray-6 w-12"></div>

          <div className="text-center">
            <p className="text-lg font-medium leading-tight">{title}</p>
            <p className="text-sm text-gray-11/90 font-inter">
              {description}
            </p>
          </div>
        </div>
      )}
    </>
  );
}