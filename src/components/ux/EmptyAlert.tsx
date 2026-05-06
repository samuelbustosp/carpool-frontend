"use client";

import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyAlert({
  icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center p-4 gap-4 w-full ">
      <div className="bg-dark-1 rounded-lg p-3">
        {icon}
      </div>
      <div className="border border-gray-6 h-12"></div>
      <div>
        <p className="text-lg font-medium leading-tight">{title}</p>
        <p className="text-sm text-gray-9 font-inter" >
          {description}
        </p>
      </div>
    </div>
  );
}

export function EmptyAlertY({
  icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 gap-2 w-full h-full bg-dark-5/70 rounded-lg">
      <div className="bg-dark-1 rounded-lg p-3">
        {icon}
      </div>
      <div className="border border-gray-6 w-12"></div>
      <div className="text-center">
        <p className="text-lg font-medium leading-tight">{title}</p>
        <p className="text-sm text-gray-9 font-inter" >
          {description}
        </p>
      </div>
    </div>
  );
}