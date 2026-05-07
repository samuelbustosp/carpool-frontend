"use client";

import { ReactNode } from "react";

interface EmptyAlertProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: "X" | "Y";
}

export function EmptyAlert({
  icon,
  title,
  description,
  variant = "X",
}: EmptyAlertProps) {
  const isY = variant === "Y";

  return (
    <div
      className={
        isY
          ? "flex flex-col items-center justify-center p-4 gap-2 w-full h-full bg-dark-5/70 rounded-lg"
          : "flex items-center justify-center p-4 gap-4 w-full"
      }
    >
      <div className="bg-dark-1 rounded-lg p-3">
        {icon}
      </div>

      <div
        className={
          isY
            ? "border border-gray-6 w-12"
            : "border border-gray-6 h-12"
        }
      />

      <div className={isY ? "text-center" : ""}>
        <p
          className="text-base font-medium mb-1"
        >
          {title}
        </p>

        <p
          className="text-xs text-gray-9 font-inter leading-4"
        >
          {description}
        </p>
      </div>
    </div>
  );
}